import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const USERS_TABLE = process.env.USERS_TABLE || '';
const ANIMAL_INTERACTIONS_TABLE = process.env.ANIMAL_INTERACTIONS_TABLE || '';

// Helper to get date string in YYYY-MM-DD format
function getDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

// Helper to check if date is today
function isToday(dateString: string): boolean {
  return dateString === getDateString(Date.now());
}

// Helper to check if date is within last N days
function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = Date.now();
  const daysAgo = now - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= daysAgo;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const date = queryParams.date || getDateString(Date.now());

    if (event.path?.includes('/daily-downloads')) {
      // Get daily downloads (new users created on a specific date)
      const startOfDay = new Date(date).setHours(0, 0, 0, 0);
      const endOfDay = new Date(date).setHours(23, 59, 59, 999);

      // Scan users table and filter by createdAt
      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: USERS_TABLE,
        })
      );

      const users = result.Items || [];
      const dailyDownloads = users.filter((user: any) => {
        const createdAt = user.createdAt || user.firstSeenAt;
        return createdAt >= startOfDay && createdAt <= endOfDay;
      });

      return successResponse({
        date,
        downloads: dailyDownloads.length,
        users: dailyDownloads.map((u: any) => ({
          userId: u.userId,
          platform: u.platform,
          createdAt: u.createdAt || u.firstSeenAt,
        })),
      });
    }

    if (event.path?.includes('/retention')) {
      // Get user retention stats
      const days = parseInt(queryParams.days || '7', 10);
      const cutoffDate = getDateString(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: USERS_TABLE,
        })
      );

      const users = result.Items || [];
      const now = Date.now();

      let newUsers = 0; // Users who first appeared in last N days
      let returningUsers = 0; // Users who came back in last N days
      let activeUsers = 0; // Users seen in last N days

      users.forEach((user: any) => {
        const firstSeen = user.firstSeenAt || user.createdAt;
        const lastSeen = user.lastSeenAt || firstSeen;
        const daysSinceFirstSeen = Math.floor((now - firstSeen) / (24 * 60 * 60 * 1000));
        const daysSinceLastSeen = Math.floor((now - lastSeen) / (24 * 60 * 60 * 1000));

        if (daysSinceFirstSeen <= days) {
          newUsers++;
        }

        if (daysSinceLastSeen <= days) {
          activeUsers++;
          
          // If first seen before the cutoff but last seen recently, they're returning
          if (firstSeen < new Date(cutoffDate).getTime() && daysSinceLastSeen <= days) {
            returningUsers++;
          }
        }
      });

      const retentionRate = newUsers > 0 
        ? ((returningUsers / (users.length - newUsers)) * 100).toFixed(2)
        : '0.00';

      return successResponse({
        period: `${days} days`,
        totalUsers: users.length,
        newUsers,
        returningUsers,
        activeUsers,
        retentionRate: `${retentionRate}%`,
      });
    }

    if (event.path?.includes('/animal-stats')) {
      // Get animal interaction statistics
      const days = parseInt(queryParams.days || '30', 10);
      const cutoffTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;

      // Query animal interactions by date
      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: ANIMAL_INTERACTIONS_TABLE,
        })
      );

      const interactions = result.Items || [];
      const recentInteractions = interactions.filter((i: any) => i.timestamp >= cutoffTimestamp);

      // Count interactions per animal
      const animalStats: Record<string, {
        name: string;
        clicks: number;
        uniqueUsers: Set<string>;
        levels: Set<string>;
      }> = {};

      recentInteractions.forEach((interaction: any) => {
        const animalName = interaction.animalName;
        if (!animalStats[animalName]) {
          animalStats[animalName] = {
            name: animalName,
            clicks: 0,
            uniqueUsers: new Set(),
            levels: new Set(),
          };
        }

        animalStats[animalName].clicks++;
        if (interaction.userId) {
          animalStats[animalName].uniqueUsers.add(interaction.userId);
        }
        if (interaction.level) {
          animalStats[animalName].levels.add(interaction.level);
        }
      });

      // Convert to array format
      const stats = Object.values(animalStats).map(stat => ({
        animalName: stat.name,
        totalClicks: stat.clicks,
        uniqueUsers: stat.uniqueUsers.size,
        levels: Array.from(stat.levels),
      })).sort((a, b) => b.totalClicks - a.totalClicks);

      return successResponse({
        period: `${days} days`,
        totalInteractions: recentInteractions.length,
        uniqueAnimals: stats.length,
        animalStats: stats,
      });
    }

    return badRequestResponse('Invalid endpoint');
  } catch (error) {
    console.error('Error processing analytics query:', error);
    return errorResponse('Failed to process analytics query', 500, error as Error);
  }
};

