import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';
const jwt = require('jsonwebtoken');

const gunzip = promisify(zlib.gunzip);

/**
 * Apple App Store Connect API Handler
 * Fetches download history from Apple's API
 */

const APPLE_KEY_ID = process.env.APPLE_KEY_ID || '';
const APPLE_ISSUER_ID = process.env.APPLE_ISSUER_ID || '';
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY || ''; // Base64 encoded or raw PEM
const APPLE_VENDOR_NUMBER = process.env.APPLE_VENDOR_NUMBER || '';

/**
 * Generate JWT token for Apple App Store Connect API
 */
function generateAppleJWT(): string {
    if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
        throw new Error('Apple API credentials not configured');
    }

    // Decode private key if it's base64 encoded
    let privateKey = APPLE_PRIVATE_KEY;
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        try {
            privateKey = Buffer.from(APPLE_PRIVATE_KEY, 'base64').toString('utf-8');
        } catch (e) {
            // Assume it's already in PEM format
        }
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: APPLE_ISSUER_ID,
        iat: now,
        exp: now + 1200, // 20 minutes
        aud: 'appstoreconnect-v1',
    };

    const token = jwt.sign(payload, privateKey, {
        algorithm: 'ES256',
        keyid: APPLE_KEY_ID,
    });

    return token;
}

/**
 * Fetch sales and trends data from Apple App Store Connect API
 * Apple API expects dates in YYYY-MM-DD format and requires individual date queries
 */
async function fetchAppleSalesData(startDate: string, endDate: string): Promise<any> {
    const token = generateAppleJWT();
    
    // Convert dates to Apple's expected format
    const start = new Date(startDate);
    const end = new Date(endDate);
    const downloads: any[] = [];
    
    // Fetch data for each day (Apple API requires individual date queries)
    // Note: Apple sales reports are typically available 24-48 hours after the date
    let successCount = 0;
    let errorCount = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const url = `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${dateStr}&filter[reportSubType]=SUMMARY&filter[reportType]=SALES&filter[vendorNumber]=${APPLE_VENDOR_NUMBER}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Apple returns CSV data, often gzipped
                const contentType = response.headers.get('content-type') || '';
                const contentEncoding = response.headers.get('content-encoding') || '';
                
                console.log(`📥 Apple API response for ${dateStr}:`, {
                    status: response.status,
                    contentType,
                    contentEncoding,
                    contentLength: response.headers.get('content-length'),
                });
                
                // Get response as buffer to handle binary/gzipped data
                const responseBuffer = Buffer.from(await response.arrayBuffer());
                
                let csvData: string;
                
                // Check if content is gzipped
                if (contentEncoding === 'gzip' || responseBuffer[0] === 0x1f && responseBuffer[1] === 0x8b) {
                    console.log(`📦 Decompressing gzipped data for ${dateStr}, buffer size: ${responseBuffer.length}`);
                    try {
                        const decompressed = await gunzip(responseBuffer);
                        csvData = decompressed.toString('utf-8');
                        console.log(`✅ Decompressed CSV for ${dateStr}:`, {
                            length: csvData.length,
                            firstLine: csvData.split('\n')[0]?.substring(0, 200),
                            lineCount: csvData.split('\n').length,
                        });
                    } catch (decompressError: any) {
                        console.error(`❌ Failed to decompress data for ${dateStr}:`, decompressError.message);
                        continue;
                    }
                } else {
                    // Not gzipped, treat as text
                    csvData = responseBuffer.toString('utf-8');
                    console.log(`📄 Plain text CSV for ${dateStr}:`, {
                        length: csvData.length,
                        firstLine: csvData.split('\n')[0]?.substring(0, 200),
                        lineCount: csvData.split('\n').length,
                    });
                }
                
                // Check if it's actually CSV (has tab-separated values or CSV structure)
                if (csvData && csvData.trim().length > 0) {
                    // Check if it looks like CSV (has tabs or commas)
                    if (csvData.includes('\t') || csvData.includes(',')) {
                        downloads.push({
                            date: dateStr,
                            rawData: csvData,
                        });
                        successCount++;
                        console.log(`✅ Got CSV data for ${dateStr}, length: ${csvData.length}`);
                    } else {
                        // Might be JSON response
                        try {
                            const data = JSON.parse(csvData);
                            if (data.data && data.data.length > 0) {
                                downloads.push(...data.data);
                                successCount++;
                                console.log(`✅ Got JSON data for ${dateStr}`);
                            } else if (data.links && data.links.self) {
                                // Apple returns a link to download the report
                                console.log(`ℹ️ Apple returned download link for ${dateStr}: ${data.links.self}`);
                                // Try to fetch the actual report
                                try {
                                    const reportResponse = await fetch(data.links.self, {
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                        },
                                    });
                                    if (reportResponse.ok) {
                                        const reportBuffer = Buffer.from(await reportResponse.arrayBuffer());
                                        let reportData: string;
                                        
                                        // Check if report is gzipped
                                        if (reportBuffer[0] === 0x1f && reportBuffer[1] === 0x8b) {
                                            const decompressed = await gunzip(reportBuffer);
                                            reportData = decompressed.toString('utf-8');
                                        } else {
                                            reportData = reportBuffer.toString('utf-8');
                                        }
                                        
                                        if (reportData && reportData.trim().length > 0) {
                                            downloads.push({
                                                date: dateStr,
                                                rawData: reportData,
                                            });
                                            successCount++;
                                            console.log(`✅ Got report data for ${dateStr} from download link`);
                                        }
                                    }
                                } catch (reportError: any) {
                                    console.warn(`Failed to fetch report from link:`, reportError.message);
                                }
                            }
                        } catch (jsonError) {
                            console.warn(`Response for ${dateStr} is not JSON or CSV, skipping`);
                        }
                    }
                }
            } else if (response.status === 404) {
                // No data for this date, skip silently
                continue;
            } else if (response.status === 410) {
                // 410 Gone - Apple no longer has data for this date (too old)
                // This is normal for dates older than ~2 years
                console.log(`ℹ️  Apple API 410 (Gone) for ${dateStr}: Data no longer available (date too old)`);
                continue;
            } else {
                const errorText = await response.text();
                console.warn(`Apple API error for ${dateStr}: ${response.status} - ${errorText.substring(0, 200)}`);
                errorCount++;
            }
        } catch (error: any) {
            console.warn(`Error fetching data for ${dateStr}:`, error.message);
            errorCount++;
        }
    }
    
    console.log(`Apple API: Fetched ${successCount} successful responses, ${errorCount} errors for date range ${startDate} to ${endDate}`);
    
    return { data: downloads };
}

/**
 * Fetch app analytics data (downloads, impressions, etc.)
 */
async function fetchAppleAnalytics(appId: string, startDate: string, endDate: string): Promise<any> {
    const token = generateAppleJWT();
    
    // Apple App Store Connect API endpoint for app analytics
    const url = `https://api.appstoreconnect.apple.com/v1/apps/${appId}/analyticsReports`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: {
                type: 'appAnalyticsReports',
                attributes: {
                    startDate: startDate,
                    endDate: endDate,
                    granularity: 'DAY',
                    groupBy: ['appVersion'],
                    metrics: ['installs', 'sessions', 'activeDevices'],
                },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apple API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const queryParams = event.queryStringParameters || {};
        const filterType = queryParams.filterType || 'all'; // 'all', 'downloads', 'iap'
        let startDate = queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = queryParams.endDate || new Date().toISOString().split('T')[0];
        const appId = queryParams.appId || '';
        
        // For all-time IAP, use a reasonable start date
        // Apple typically keeps sales reports for ~2 years, so limit to recent dates
        if (filterType === 'iap' && !queryParams.startDate) {
            // Use date from 2 years ago (Apple's typical retention period)
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            startDate = twoYearsAgo.toISOString().split('T')[0];
            console.log(`📅 All-time IAP query: Using start date ${startDate} (2 years ago, Apple's typical retention)`);
        }
        
        // Check if credentials are configured
        if (!APPLE_KEY_ID || !APPLE_ISSUER_ID || !APPLE_PRIVATE_KEY) {
            return successResponse({
                error: 'Apple App Store Connect API credentials not configured',
                message: 'Please configure APPLE_KEY_ID, APPLE_ISSUER_ID, and APPLE_PRIVATE_KEY environment variables',
                downloads: [],
            });
        }

        try {
            // Try to fetch sales data
            console.log(`📊 Fetching Apple sales data: ${startDate} to ${endDate}, filterType: ${filterType}`);
            const salesData = await fetchAppleSalesData(startDate, endDate);
            
            console.log(`📦 Raw Apple API response structure:`, {
                hasData: !!salesData.data,
                dataLength: salesData.data?.length || 0,
                sampleItem: salesData.data?.[0] || null,
            });
            
            // Parse and format the data
            let downloads = parseAppleSalesData(salesData);
            
            console.log(`📈 Parsed downloads before filtering:`, {
                count: downloads.length,
                sample: downloads.slice(0, 3),
                totalDownloads: downloads.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0),
                totalRevenue: downloads.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0),
            });
            
            // Filter for IAP if requested
            if (filterType === 'iap') {
                downloads = downloads.filter((d: any) => d.isIAP === true);
                console.log(`🔍 Filtered for IAP: ${downloads.length} entries`);
            } else if (filterType === 'downloads') {
                downloads = downloads.filter((d: any) => d.isIAP !== true);
                console.log(`🔍 Filtered for downloads only: ${downloads.length} entries`);
            }
            
            const totalDownloads = downloads.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0);
            const totalRevenue = downloads.reduce((sum: number, d: any) => sum + (d.revenue || 0), 0);
            
            console.log(`✅ Final result:`, {
                totalDownloads,
                totalRevenue,
                downloadCount: downloads.length,
                filterType,
            });
            
            // If no downloads from sales API, try analytics API if appId provided
            if (totalDownloads === 0 && appId && filterType !== 'iap') {
                try {
                    console.log('No sales data found, trying Analytics API...');
                    const analyticsData = await fetchAppleAnalytics(appId, startDate, endDate);
                    const analyticsDownloads = parseAppleAnalyticsData(analyticsData);
                    const analyticsTotal = analyticsDownloads.reduce((sum: number, d: any) => sum + (d.installs || 0), 0);
                    
                    if (analyticsTotal > 0) {
                        return successResponse({
                            startDate,
                            endDate,
                            source: 'Apple App Store Connect Analytics',
                            totalDownloads: analyticsTotal,
                            downloads: analyticsDownloads.map((d: any) => ({
                                date: d.date,
                                downloads: d.installs || 0,
                                sessions: d.sessions || 0,
                                activeDevices: d.activeDevices || 0,
                            })),
                        });
                    }
                } catch (analyticsError: any) {
                    console.warn('Analytics API also returned no data:', analyticsError.message);
                }
            }
            
            return successResponse({
                startDate,
                endDate,
                source: 'Apple App Store Connect',
                filterType: filterType,
                totalDownloads: totalDownloads,
                totalRevenue: totalRevenue,
                downloads: downloads,
                note: totalDownloads === 0 ? (filterType === 'iap' ? 'No in-app purchases found. This could mean: 1) No users have made purchases yet, 2) Reports not yet available (Apple reports are typically available 24-48 hours after the date), 3) IAP products may not be configured correctly' : 'No downloads found. Possible reasons: 1) App not yet published to App Store, 2) No downloads in this period, 3) Reports not yet available (Apple reports are typically available 24-48 hours after the date), 4) App may need to be published and have downloads before data appears') : undefined,
            });
        } catch (error: any) {
            console.error('Error fetching Apple sales data:', error);
            return errorResponse(`Failed to fetch Apple App Store Connect data: ${error.message}`, 500, error);
        }
    } catch (error: any) {
        console.error('Error in Apple Connect handler:', error);
        return errorResponse('Failed to process Apple Connect request', 500, error);
    }
};

/**
 * Parse Apple sales data response
 * Apple returns CSV data, need to parse it
 */
function parseAppleSalesData(data: any): any[] {
    const downloads: any[] = [];
    
    if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => {
            // Apple returns CSV data in attributes
            const csvData = item.attributes?.content || '';
            if (csvData) {
                // Parse CSV: Provider, Provider Country, SKU, Developer, Title, Version, Product Type Identifier, Units, Developer Proceeds, Begin Date, End Date, Customer Currency, Country Code
                const lines = csvData.split('\n').filter((line: string) => line.trim());
                lines.forEach((line: string, index: number) => {
                    if (index === 0) return; // Skip header
                    const parts = line.split('\t');
                    if (parts.length >= 10) {
                        const productType = parts[6]?.trim() || '';
                        const units = parseInt(parts[7]?.trim() || '0', 10) || 0;
                        const revenue = parseFloat(parts[8]?.trim() || '0') || 0;
                        let beginDate = parts[9]?.trim() || '';
                        
                        // Product Type Identifier codes:
                        // 1, 1F = App (download)
                        // 7, 7F = In-App Purchase
                        // IA-IZ = In-App Purchase variants
                        const isIAP = productType.startsWith('7') || productType.startsWith('IA') || productType.startsWith('IB') || productType.startsWith('IC') || productType.startsWith('ID') || productType === 'IAP';
                        
                        // Convert MM/DD/YYYY to YYYY-MM-DD if needed
                        if (beginDate && beginDate.includes('/')) {
                            const dateParts = beginDate.split('/');
                            if (dateParts.length === 3) {
                                const [month, day, year] = dateParts;
                                beginDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                            }
                        }
                        
                        // Log high-value transactions for debugging
                        if (revenue > 100) {
                            console.log(`💵 HIGH VALUE: Date=${beginDate}, Revenue=${revenue}, Units=${units}, ProductType=${productType}, SKU="${parts[2]?.trim()}", Title="${parts[4]?.trim()}", Country="${parts[12]?.trim()}"`);
                        }
                        
                        downloads.push({
                            date: beginDate,
                            downloads: units,
                            revenue: revenue,
                            sku: parts[2]?.trim() || '',
                            title: parts[4]?.trim() || '',
                            country: parts[12]?.trim() || '',
                            productType: productType,
                            isIAP: isIAP,
                        });
                    }
                });
            } else {
                // Fallback if no CSV data
                downloads.push({
                    date: item.attributes?.reportDate || '',
                    downloads: 0,
                    revenue: 0,
                });
            }
        });
    }
    
    // Also check if we have raw CSV data from the new format
    if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => {
            if (item.rawData) {
                const lines = item.rawData.split('\n').filter((line: string) => line.trim());
                console.log(`Parsing CSV for ${item.date}, ${lines.length} lines`);
                lines.forEach((line: string, index: number) => {
                    if (index === 0) {
                        // Log header to debug
                        console.log(`CSV Header: ${line.substring(0, 300)}`);
                        return; // Skip header
                    }
                    const parts = line.split('\t');
                    
                    // Log full row for IAP purchases to debug
                    const productType = parts[6]?.trim() || '';
                    if (productType.startsWith('7') && parts.length > 15) {
                        console.log(`🔍 RAW IAP ROW (${parts.length} columns): ${parts.slice(0, 20).join(' | ')}`);
                        console.log(`   Column 8 (Developer Proceeds): "${parts[8]?.trim()}"`);
                        console.log(`   Column 15 (Customer Price): "${parts[15]?.trim()}"`);
                        console.log(`   Column 7 (Units): "${parts[7]?.trim()}"`);
                    }
                    
                    if (parts.length >= 10) {
                        // Apple CSV format: Provider, Provider Country, SKU, Developer, Title, Version, Product Type Identifier, Units, Developer Proceeds, Begin Date, End Date, Customer Currency, Country Code, Currency of Proceeds, Apple Identifier, Customer Price
                        // Column indices: 0=Provider, 1=Provider Country, 2=SKU, 3=Developer, 4=Title, 5=Version, 6=Product Type, 7=Units, 8=Developer Proceeds, 9=Begin Date, 10=End Date, 11=Customer Currency, 12=Country Code, 13=Currency of Proceeds, 15=Customer Price
                        const units = parseInt(parts[7]?.trim() || '0', 10) || 0;
                        const revenueRaw = parts[8]?.trim() || '0';
                        const revenue = parseFloat(revenueRaw) || 0;
                        const customerPrice = parts.length > 15 ? parts[15]?.trim() : 'N/A'; // Column 15 = Customer Price
                        const customerCurrency = parts[11]?.trim() || 'N/A'; // Column 11 = Customer Currency
                        const proceedsCurrency = parts.length > 13 ? parts[13]?.trim() : 'N/A'; // Column 13 = Currency of Proceeds
                        const sku = parts[2]?.trim() || '';
                        
                        // Parse date - could be in format YYYY-MM-DD or YYYY-MM-DD HH:MM:SS or MM/DD/YYYY
                        let beginDate = item.date; // Fallback to the date from the API call
                        if (parts[9] && parts[9].trim()) {
                            const dateStr = parts[9].trim();
                            // Extract date part (before space if there's a time component)
                            beginDate = dateStr.split(' ')[0].split('T')[0];
                            // Validate it's a date format
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(beginDate)) {
                                // If not valid, use the item date
                                beginDate = item.date;
                            }
                        }
                        
                        // Log detailed info for IAP purchases (productType 7F) and high-value transactions
                        if (productType.startsWith('7')) {
                            console.log(`💰 IAP Purchase: Date=${beginDate}, Units=${units}, DeveloperProceeds="${revenueRaw}" (parsed=${revenue}), CustomerPrice="${customerPrice}", SKU="${sku}", ProductType="${productType}"`);
                        } else if (revenue > 100 || (productType && productType.startsWith('IA'))) {
                            // Log high-value transactions and IA product types
                            const title = parts[4]?.trim() || 'N/A';
                            const country = parts[12]?.trim() || 'N/A';
                            console.log(`💵 HIGH VALUE/IA Product: Date=${beginDate}, ProductType="${productType}", SKU="${sku}", Title="${title}", Units=${units}, DeveloperProceeds="${revenueRaw}" (${proceedsCurrency}), CustomerPrice="${customerPrice}" (${customerCurrency}), Country="${country}", ProceedsCurrency="${proceedsCurrency}"`);
                        } else {
                            console.log(`  → Parsed: Date=${beginDate}, Units=${units}, Revenue=${revenue}, ProductType=${productType || 'N/A'}`);
                        }
                        
                        // Convert revenue to USD if needed
                        // Apple reports Developer Proceeds in the currency specified in "Currency of Proceeds" column
                        let revenueUSD = revenue;
                        
                        if (proceedsCurrency && proceedsCurrency !== 'USD' && proceedsCurrency !== 'N/A' && revenue > 0) {
                            // If proceeds are in non-USD currency, convert to USD
                            // We can calculate conversion rate from customer price if available
                            const customerPriceNum = parseFloat(customerPrice) || 0;
                            
                            if (customerPriceNum > 0 && customerCurrency && customerCurrency !== 'N/A') {
                                // Estimate USD equivalent of customer price based on known conversions
                                // For KZT: 1,790 KZT ≈ $3.50 USD (from user input)
                                let customerPriceUSD = 0;
                                
                                if (customerCurrency === 'KZT') {
                                    // 1,790 KZT = $3.50 USD, so 1 KZT = $0.001955 USD
                                    customerPriceUSD = customerPriceNum * 0.001955;
                                } else {
                                    // For other currencies, use approximate rates
                                    // This is a simplified approach - ideally use real-time exchange rates
                                    const exchangeRates: { [key: string]: number } = {
                                        'EUR': 1.10, // 1 EUR ≈ 1.10 USD
                                        'GBP': 1.27, // 1 GBP ≈ 1.27 USD
                                        'CAD': 0.73, // 1 CAD ≈ 0.73 USD
                                        'AUD': 0.66, // 1 AUD ≈ 0.66 USD
                                        'JPY': 0.0067, // 1 JPY ≈ 0.0067 USD
                                        'CNY': 0.14, // 1 CNY ≈ 0.14 USD
                                    };
                                    
                                    const rate = exchangeRates[customerCurrency] || 1;
                                    customerPriceUSD = customerPriceNum * rate;
                                }
                                
                                if (customerPriceUSD > 0) {
                                    // Calculate conversion rate: customerPriceUSD / customerPriceNum
                                    const conversionRate = customerPriceUSD / customerPriceNum;
                                    revenueUSD = revenue * conversionRate;
                                    
                                    console.log(`💱 Currency Conversion: ${revenue} ${proceedsCurrency} → $${revenueUSD.toFixed(2)} USD (rate: ${conversionRate.toFixed(6)})`);
                                } else {
                                    console.warn(`⚠️ Cannot convert ${revenue} ${proceedsCurrency} to USD - unknown currency or missing conversion rate`);
                                }
                            } else {
                                console.warn(`⚠️ Revenue in ${proceedsCurrency} (${revenue}) but cannot convert - missing customer price or currency info`);
                            }
                        }
                        
                        if (units > 0 || revenue > 0) {
                            downloads.push({
                                date: beginDate,
                                downloads: units,
                                revenue: revenueUSD, // Use USD-converted value
                                revenueCurrency: proceedsCurrency, // Include original currency for reference
                                sku: parts[2]?.trim() || '',
                                title: parts[4]?.trim() || '',
                                country: parts[12]?.trim() || '',
                                customerPrice: customerPrice,
                                customerCurrency: customerCurrency,
                            });
                        }
                    } else {
                        console.warn(`  ⚠️ Row ${index} has only ${parts.length} columns, expected at least 9`);
                    }
                });
            }
        });
    }
    
    // Group by date and sum downloads/revenue
    const grouped: { [key: string]: any } = {};
    downloads.forEach((d: any) => {
        // Skip invalid entries
        if (!d.date || d.date.trim() === '' || (!d.downloads && !d.revenue)) {
            return;
        }
        const date = d.date.split(' ')[0]; // Extract date part
        // Skip if date is still invalid after extraction
        if (!date || date.trim() === '') {
            return;
        }
        if (!grouped[date]) {
            grouped[date] = { 
                date, 
                downloads: 0, 
                revenue: 0,
                transactions: [] // Store individual transactions for details
            };
        }
        grouped[date].downloads += d.downloads || 0;
        grouped[date].revenue += d.revenue || 0;
        // Store transaction details if available
        if (d.revenueCurrency || d.customerPrice || d.sku || d.title) {
            grouped[date].transactions.push({
                revenue: d.revenue,
                revenueCurrency: d.revenueCurrency,
                customerPrice: d.customerPrice,
                customerCurrency: d.customerCurrency,
                sku: d.sku,
                title: d.title,
                country: d.country,
            });
        }
    });
    
    // Filter out entries with zero downloads and revenue, then sort
    return Object.values(grouped)
        .filter((d: any) => d.downloads > 0 || d.revenue > 0)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
}

/**
 * Parse Apple analytics data response
 */
function parseAppleAnalyticsData(data: any): any[] {
    const downloads: any[] = [];
    
    if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => {
            downloads.push({
                date: item.attributes?.date || '',
                installs: item.attributes?.installs || 0,
                sessions: item.attributes?.sessions || 0,
                activeDevices: item.attributes?.activeDevices || 0,
            });
        });
    }
    
    return downloads;
}

