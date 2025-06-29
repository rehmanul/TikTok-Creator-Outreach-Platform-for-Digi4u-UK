# TikTok Creator Marketplace API Implementation

## Overview

This platform now fully integrates with TikTok's Creator Marketplace API, providing access to first-party creator data, campaign management tools, and real-time performance analytics.

## API Integration Details

### Authentication
- **App ID**: 7519035078651936769
- **Sandbox Advertiser ID**: 7519829315018588178
- **OAuth 2.0 Flow**: `/api/tiktok/auth/url` generates authorization URL
- **Access Token**: Stored securely after OAuth callback

### Implemented Endpoints

#### 1. Creator Discovery
```
GET /api/creators/search
```
- Search creators by category, location, followers, engagement rate
- Returns real TikTok creator data with demographics
- Fallback to database if API unavailable

#### 2. Creator Insights
```
GET /api/creators/:id/insights
```
- Audience demographics (gender, age, location)
- Engagement metrics and growth trends
- Best performing content analysis
- Top interests and posting times

#### 3. Campaign Management
```
POST /api/campaigns
```
- Creates campaign orders in TikTok Creator Marketplace
- Manages creator invitations and collaborations
- Tracks performance metrics in real-time

#### 4. Performance Analytics
```
GET /api/analytics/campaign/:id
```
- Views, likes, comments, shares
- Engagement rates and conversions
- Revenue tracking and ROI calculation
- Creator-level performance data

## TikTok API Service Methods

### searchCreators()
- Filters: categories, countries, follower count, engagement rate
- Sorting: by follower count, engagement, or relevance
- Pagination: configurable page size

### getCreatorInsights()
- Audience distribution data
- Content performance metrics
- Growth rate analysis
- Optimal posting times

### createCampaignOrder()
- Campaign setup with budget and timeline
- Product information linking
- Creator assignment
- Collaboration type specification

### sendInvitation()
- Personalized messaging
- Collaboration terms
- Payment structure
- Tracking via invitation ID

### getCampaignPerformance()
- Real-time metrics updates
- Conversion tracking
- Revenue attribution
- Engagement analytics

## Data Flow

1. **Creator Discovery**
   - Search via TikTok API → Store in database → Display in UI

2. **Campaign Creation**
   - Create order in TikTok → Get order ID → Track locally

3. **Invitation Process**
   - Generate personalized message → Send via API → Track response

4. **Performance Monitoring**
   - Fetch metrics from API → Update database → Display analytics

## Environment Configuration

Required environment variables:
```
TIKTOK_CLIENT_KEY=7519035078651936769
TIKTOK_CLIENT_SECRET=[Your Secret]
TIKTOK_ADVERTISER_ID=7519829315018588178
TIKTOK_ACCESS_TOKEN=[Generated via OAuth]
```

## API Rate Limits

- Basic tier: 100 requests per minute
- Advanced tier: 1,000 requests per minute
- Premium tier: 10,000 requests per minute

Current implementation includes:
- Rate limiting protection
- Automatic retry logic
- Fallback to cached data
- Error handling and logging

## Webhook Integration

Supported events:
- Message viewed by creator
- Creator response received
- Collaboration accepted/rejected
- Content published
- Performance milestones

## Testing in Sandbox

The platform is configured to use TikTok's sandbox environment in development mode:
- Base URL: https://sandbox-ads.tiktok.com/open_api/v1.3
- Test advertiser ID provided
- No real charges or messages sent
- Perfect for testing workflows

## Production Deployment

To switch to production:
1. Change NODE_ENV to 'production'
2. Update redirect URLs in TikTok app settings
3. Complete business verification
4. Request production API access
5. Update rate limits as needed

## Security Considerations

- OAuth tokens encrypted at rest
- Webhook signatures verified
- API keys stored as environment variables
- HTTPS required for all callbacks
- Rate limiting on all endpoints

## Troubleshooting

Common issues and solutions:

1. **Authentication Errors**
   - Verify CLIENT_SECRET is correct
   - Check OAuth redirect URL matches app settings
   - Ensure access token is valid

2. **API Rate Limits**
   - Implement exponential backoff
   - Cache frequently accessed data
   - Use batch operations where possible

3. **Data Sync Issues**
   - Verify webhook endpoints are accessible
   - Check signature verification logic
   - Monitor event processing queue

This implementation provides a complete integration with TikTok's Creator Marketplace API, enabling automated creator discovery, campaign management, and performance tracking for affiliate marketing.