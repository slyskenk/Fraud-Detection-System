import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { RateLimitService } from './rate-limit.service';
import { Request, Response, NextFunction } from 'express';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let rateLimitService: jest.Mocked<RateLimitService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitMiddleware,
        {
          provide: RateLimitService,
          useValue: {
            checkGeneralRateLimit: jest.fn(),
            checkAuthRateLimit: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
    rateLimitService = module.get(RateLimitService);

    mockRequest = {
      path: '/api/test',
      ip: '192.168.1.1',
      headers: {},
      socket: { remoteAddress: '192.168.1.1' } as any,
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('general endpoints', () => {
    it('should allow request when under rate limit', async () => {
      rateLimitService.checkGeneralRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
        resetTime: Date.now() + 60000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        '100',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        '99',
      );
    });

    it('should block request when over rate limit', async () => {
      rateLimitService.checkGeneralRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      });

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(HttpException);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '60');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use user ID from JWT when available', async () => {
      mockRequest = {
        ...mockRequest,
        user: { userId: 'user123' },
      } as any;

      rateLimitService.checkGeneralRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
        resetTime: Date.now() + 60000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(rateLimitService.checkGeneralRateLimit).toHaveBeenCalledWith(
        'user123',
      );
    });
  });

  describe('auth endpoints', () => {
    beforeEach(() => {
      mockRequest = {
        ...mockRequest,
        path: '/api/auth/login',
      };
    });

    it('should use IP-based rate limiting for auth endpoints', async () => {
      rateLimitService.checkAuthRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 60000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(rateLimitService.checkAuthRateLimit).toHaveBeenCalledWith(
        '192.168.1.1',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        '5',
      );
    });

    it('should block auth requests when over limit', async () => {
      rateLimitService.checkAuthRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      });

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should extract IP from X-Forwarded-For header', async () => {
      mockRequest.headers = {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      };

      rateLimitService.checkAuthRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 60000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(rateLimitService.checkAuthRateLimit).toHaveBeenCalledWith(
        '203.0.113.1',
      );
    });
  });

  describe('error handling', () => {
    it('should allow request on service error (fail open)', async () => {
      rateLimitService.checkGeneralRateLimit.mockRejectedValue(
        new Error('Service error'),
      );

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw HttpException when rate limit exceeded', async () => {
      rateLimitService.checkGeneralRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      });

      try {
        await middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    });
  });
});
