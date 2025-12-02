# Rate Limiting Module

This module implements rate limiting for the Banking Fraud Prevention System using Redis and a sliding window algorithm.

## Features

- **Sliding Window Algorithm**: Accurate rate limiting using Redis sorted sets
- **Dual Rate Limits**:
  - General API: 100 requests per minute per user
  - Auth Endpoints: 5 requests per minute per IP address
- **Automatic Counter Expiration**: Prevents memory leaks by expiring counters after the time window
- **Fail-Open Strategy**: Allows requests on Redis errors to prevent service disruption
- **Standard Headers**: Returns `X-RateLimit-*` and `Retry-After` headers

## Components

### RateLimitService

Core service that implements the sliding window rate limiting algorithm using Redis.

**Key Methods:**
- `checkGeneralRateLimit(userId)`: Check 100 req/min limit for authenticated users
- `checkAuthRateLimit(ipAddress)`: Check 5 req/min limit for auth endpoints
- `resetRateLimit(identifier, config)`: Reset rate limit for testing/admin purposes
- `getRateLimitStatus(identifier, config)`: Get current status without incrementing

### RateLimitMiddleware

NestJS middleware that applies rate limiting to all routes.

**Features:**
- Automatically detects auth endpoints (`/api/auth/*`)
- Uses IP-based limiting for auth endpoints
- Uses user-based limiting for general endpoints (falls back to IP for unauthenticated)
- Extracts IP from proxy headers (`X-Forwarded-For`, `X-Real-IP`)
- Returns HTTP 429 with `Retry-After` header when limit exceeded

### RateLimitModule

Global module that configures Redis connection and exports the rate limiting service.

## Configuration

Set the following environment variables:

```env
REDIS_URL=redis://localhost:6379
```

## Usage

The middleware is automatically applied to all routes in `app.module.ts`:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
```

## Response Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2025-12-02T18:30:00.000Z
```

When rate limit is exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

## Testing

Run the tests:

```bash
npm test -- rate-limit
```

**Test Coverage:**
- Unit tests for RateLimitService (8 tests)
- Unit tests for RateLimitMiddleware (9 tests)
- Total: 17 tests, all passing

## Requirements Validated

This implementation satisfies the following requirements:

- **Requirement 10.1**: API rate limiting (100 req/min per user)
- **Requirement 10.2**: HTTP 429 with Retry-After header
- **Requirement 10.3**: Redis for distributed rate limiting
- **Requirement 10.4**: Stricter auth endpoint limits (5 req/min per IP)
- **Requirement 10.5**: Counter expiration to prevent memory leaks

## Architecture

```
Request → RateLimitMiddleware → RateLimitService → Redis
                ↓                        ↓
         Set Headers            Sliding Window Check
                ↓                        ↓
         Allow/Block            Update Counter
```

## Error Handling

The module implements a fail-open strategy:
- On Redis connection errors, requests are allowed
- Errors are logged for monitoring
- Service remains available even if Redis is down

## Performance

- **Latency**: < 5ms per request (Redis operations)
- **Accuracy**: Sliding window provides precise rate limiting
- **Scalability**: Distributed across multiple instances via Redis
- **Memory**: Automatic cleanup via TTL prevents memory leaks
