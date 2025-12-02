import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Rate limit configurations
  private readonly generalConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    keyPrefix: 'rate_limit:general',
  };

  private readonly authConfig: RateLimitConfig = {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    keyPrefix: 'rate_limit:auth',
  };

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Check rate limit using sliding window algorithm
   * @param identifier - User ID or IP address
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // Remove old entries outside the time window
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Count requests in current window
      pipeline.zcard(key);

      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiration to prevent memory leaks
      pipeline.expire(key, Math.ceil(config.windowMs / 1000));

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline execution failed');
      }

      // Extract count from pipeline results
      // results[1] is the zcard result [error, count]
      const count = results[1][1] as number;

      const allowed = count < config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - count - 1);
      const resetTime = now + config.windowMs;

      const result: RateLimitResult = {
        allowed,
        remaining,
        resetTime,
      };

      if (!allowed) {
        result.retryAfter = Math.ceil(config.windowMs / 1000);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Rate limit check failed for ${identifier}: ${error.message}`,
        error.stack,
      );
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }
  }

  /**
   * Check general API rate limit (100 req/min per user)
   * @param userId - User identifier
   * @returns Rate limit result
   */
  async checkGeneralRateLimit(userId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(userId, this.generalConfig);
  }

  /**
   * Check authentication endpoint rate limit (5 req/min per IP)
   * @param ipAddress - IP address
   * @returns Rate limit result
   */
  async checkAuthRateLimit(ipAddress: string): Promise<RateLimitResult> {
    return this.checkRateLimit(ipAddress, this.authConfig);
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - User ID or IP address
   * @param config - Rate limit configuration
   */
  async resetRateLimit(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<void> {
    const key = `${config.keyPrefix}:${identifier}`;
    try {
      await this.redis.del(key);
      this.logger.log(`Rate limit reset for ${identifier}`);
    } catch (error) {
      this.logger.error(
        `Failed to reset rate limit for ${identifier}: ${error.message}`,
      );
    }
  }

  /**
   * Get current rate limit status without incrementing
   * @param identifier - User ID or IP address
   * @param config - Rate limit configuration
   * @returns Current rate limit status
   */
  async getRateLimitStatus(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Remove old entries and count current requests
      await this.redis.zremrangebyscore(key, 0, windowStart);
      const count = await this.redis.zcard(key);

      const allowed = count < config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - count);
      const resetTime = now + config.windowMs;

      const result: RateLimitResult = {
        allowed,
        remaining,
        resetTime,
      };

      if (!allowed) {
        result.retryAfter = Math.ceil(config.windowMs / 1000);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit status for ${identifier}: ${error.message}`,
      );
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }
  }
}
