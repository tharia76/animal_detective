/**
 * TikTok Access Token Storage
 * 
 * Stores and retrieves OAuth access tokens for Events API
 */

import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB } from './dynamodb';

const dynamoClient = dynamoDB;

const TOKEN_TABLE = process.env.TIKTOK_TOKEN_TABLE || 'tiktok-access-tokens-dev';
const TOKEN_KEY = 'default'; // Use 'default' for app-level token

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp
  refresh_expires_at?: number;
  scope?: string;
  token_type?: string;
}

/**
 * Store access token obtained from OAuth exchange
 */
export async function storeAccessToken(tokenData: TokenData): Promise<void> {
  const expiresAt = tokenData.expires_at || (Date.now() / 1000) + (tokenData.expires_at || 7200);
  
  await dynamoClient.send(
    new PutCommand({
      TableName: TOKEN_TABLE,
      Item: {
        token_key: TOKEN_KEY,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        refresh_expires_at: tokenData.refresh_expires_at,
        scope: tokenData.scope,
        token_type: tokenData.token_type || 'Bearer',
        updated_at: Date.now() / 1000,
      },
    })
  );
  
  console.log('✅ TikTok access token stored');
}

/**
 * Get stored access token
 * Returns null if token doesn't exist or is expired
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const result = await dynamoClient.send(
      new GetCommand({
        TableName: TOKEN_TABLE,
        Key: { token_key: TOKEN_KEY },
      })
    );

    if (!result.Item) {
      console.log('⚠️ No stored access token found');
      return null;
    }

    const token = result.Item.access_token as string;
    const expiresAt = result.Item.expires_at as number;
    const now = Date.now() / 1000;

    // Check if token is expired (with 5 min buffer)
    if (expiresAt && expiresAt < now + 300) {
      console.log('⚠️ Stored access token is expired');
      return null;
    }

    console.log('✅ Retrieved stored access token');
    return token;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
}

/**
 * Check if we have a valid access token
 */
export async function hasValidAccessToken(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

