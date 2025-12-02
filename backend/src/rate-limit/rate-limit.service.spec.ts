import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import Redis from 'ioredis';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Create a mock Redis client
    redisMock = {
      pipeline: jest.fn().mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 0], // zremrangebyscore result
          [null, 0], // zcard result (count)
          [null, 1], // zadd result
          [null, 1], // expire result
        ]),
      }),
      zremrangebyscore: jest.fn().mockResolvedValue(0),
      zcard: jest.fn().mockResolvedValue(0),
      del: jest.fn().mockResolvedValue(1),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkGeneralRateLimit', () => {
    it('should allow request when under limit', async () => {
      const result = await service.checkGeneralRateLimit('user123');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should block request when over limit', async () => {
      // Mock Redis to return count at limit
      redisMock.pipeline = jest.fn().mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 0],
          [null, 100], // At limit
          [null, 1],
          [null, 1],
        ]),
      });

      const result = await service.checkGeneralRateLimit('user123');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe('checkAuthRateLimit', () => {
    it('should allow request when under limit', async () => {
      const result = await service.checkAuthRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should block request when over auth limit', async () => {
      // Mock Redis to return count at auth limit
      redisMock.pipeline = jest.fn().mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 0],
          [null, 5], // At auth limit
          [null, 1],
          [null, 1],
        ]),
      });

      const result = await service.checkAuthRateLimit('192.168.1.1');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60); // 60 seconds
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', async () => {
      await service.resetRateLimit('user123', {
        maxRequests: 100,
        windowMs: 60000,
        keyPrefix: 'rate_limit:general',
      });

      expect(redisMock.del).toHaveBeenCalledWith('rate_limit:general:user123');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current status without incrementing', async () => {
      redisMock.zcard.mockResolvedValue(50);

      const result = await service.getRateLimitStatus('user123', {
        maxRequests: 100,
        windowMs: 60000,
        keyPrefix: 'rate_limit:general',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50);
    });
  });

  describe('error handling', () => {
    it('should fail open on Redis error', async () => {
      redisMock.pipeline = jest.fn().mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
      });

      const result = await service.checkGeneralRateLimit('user123');

      // Should allow request on error (fail open)
      expect(result.allowed).toBe(true);
    });
  });
});
