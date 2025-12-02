import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isAuthEndpoint = this.isAuthEndpoint(req.path);
    
    try {
      let rateLimitResult;

      if (isAuthEndpoint) {
        // Use IP-based rate limiting for auth endpoints
        const ipAddress = this.getClientIp(req);
        rateLimitResult = await this.rateLimitService.checkAuthRateLimit(ipAddress);
        
        this.logger.debug(
          `Auth rate limit check for IP ${ipAddress}: ${rateLimitResult.allowed ? 'allowed' : 'blocked'}`,
        );
      } else {
        // Use user-based rate limiting for general endpoints
        const userId = this.getUserId(req);
        
        if (userId) {
          rateLimitResult = await this.rateLimitService.checkGeneralRateLimit(userId);
          
          this.logger.debug(
            `General rate limit check for user ${userId}: ${rateLimitResult.allowed ? 'allowed' : 'blocked'}`,
          );
        } else {
          // If no user ID (unauthenticated), use IP-based limiting
          const ipAddress = this.getClientIp(req);
          rateLimitResult = await this.rateLimitService.checkGeneralRateLimit(ipAddress);
          
          this.logger.debug(
            `General rate limit check for IP ${ipAddress}: ${rateLimitResult.allowed ? 'allowed' : 'blocked'}`,
          );
        }
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', isAuthEndpoint ? '5' : '100');
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(rateLimitResult.resetTime).toISOString(),
      );

      if (!rateLimitResult.allowed) {
        // Set Retry-After header
        if (rateLimitResult.retryAfter) {
          res.setHeader('Retry-After', rateLimitResult.retryAfter.toString());
        }

        this.logger.warn(
          `Rate limit exceeded for ${isAuthEndpoint ? 'auth' : 'general'} endpoint: ${req.path}`,
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            error: 'Too Many Requests',
            retryAfter: rateLimitResult.retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // On unexpected errors, log and allow the request (fail open)
      this.logger.error(
        `Rate limit middleware error: ${error.message}`,
        error.stack,
      );
      next();
    }
  }

  /**
   * Check if the request path is an authentication endpoint
   * @param path - Request path
   * @returns True if auth endpoint
   */
  private isAuthEndpoint(path: string): boolean {
    const authPaths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];
    return authPaths.some((authPath) => path.startsWith(authPath));
  }

  /**
   * Extract user ID from JWT token in request
   * @param req - Express request
   * @returns User ID or null
   */
  private getUserId(req: Request): string | null {
    // Extract user ID from JWT payload (set by JWT strategy)
    const user = (req as any).user;
    return user?.userId || user?.sub || null;
  }

  /**
   * Get client IP address from request
   * @param req - Express request
   * @returns IP address
   */
  private getClientIp(req: Request): string {
    // Check for IP in various headers (proxy-aware)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = (forwarded as string).split(',');
      return ips[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return realIp as string;
    }

    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
