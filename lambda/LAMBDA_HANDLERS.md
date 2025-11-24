# Lambda Handler Configuration

## Handler Names

When uploading the zip file to Lambda, use these handler names based on which function you're creating:

### 1. Health Check Function
- **Handler**: `handlers.health.handler`
- **Purpose**: Health check endpoint
- **Endpoint**: `GET /health`

### 2. Analytics Function
- **Handler**: `handlers.analytics.handler`
- **Purpose**: Track analytics events
- **Endpoint**: `POST /analytics`

### 3. Game Events Function
- **Handler**: `handlers.gameEvents.handler`
- **Purpose**: Track game events (level completions, etc.)
- **Endpoint**: `POST /game-events`

### 4. User Data Function
- **Handler**: `handlers.userData.handler`
- **Purpose**: Get/update user data
- **Endpoints**: `GET /users/{userId}`, `PUT /users/{userId}`

### 5. Sessions Function
- **Handler**: `handlers.sessions.handler`
- **Purpose**: Track session start/end
- **Endpoints**: `POST /sessions/start`, `POST /sessions/end`

### 6. Animal Interactions Function
- **Handler**: `handlers.animalInteractions.handler`
- **Purpose**: Track animal clicks/interactions
- **Endpoint**: `POST /animals/click`

### 7. Analytics Queries Function
- **Handler**: `handlers.analyticsQueries.handler`
- **Purpose**: Query analytics (daily downloads, retention, animal stats)
- **Endpoints**: 
  - `GET /analytics/daily-downloads`
  - `GET /analytics/retention`
  - `GET /analytics/animal-stats`

## Runtime Settings

- **Runtime**: Node.js 22.x ✅ (works fine, newer than 20.x)
- **Architecture**: arm64 ✅ (works fine)
- **Handler**: Change from `app.handler` to one of the handlers above

## Quick Setup

1. **For testing**: Use `handlers.health.handler` first
2. **For production**: Create separate Lambda functions for each handler
3. **Or**: Use one function with API Gateway routing (more complex)

## Current Configuration Issue

Your current handler is set to `app.handler` but it should be:
- `handlers.health.handler` (for health check)
- Or any other handler from the list above

Change it in Lambda Console → Configuration → Runtime settings → Edit → Handler

