/**
 * Rate Limiting Demo Script
 * 
 * This script demonstrates the rate limiting functionality.
 * Run with: ts-node src/rate-limit/demo.ts
 * 
 * Prerequisites:
 * - Redis must be running on localhost:6379
 */

import Redis from 'ioredis';
import { RateLimitService } from './rate-limit.service';

async function demo() {
  console.log('🚀 Rate Limiting Demo\n');

  // Create Redis client
  const redis = new Redis('redis://localhost:6379');
  
  // Create rate limit service
  const rateLimitService = new RateLimitService(redis);

  console.log('📊 Testing General Rate Limit (100 req/min)');
  console.log('─'.repeat(50));

  // Test general rate limit
  for (let i = 1; i <= 5; i++) {
    const result = await rateLimitService.checkGeneralRateLimit('demo-user');
    console.log(`Request ${i}:`);
    console.log(`  ✓ Allowed: ${result.allowed}`);
    console.log(`  ✓ Remaining: ${result.remaining}`);
    console.log(`  ✓ Reset Time: ${new Date(result.resetTime).toISOString()}`);
    if (result.retryAfter) {
      console.log(`  ⏱️  Retry After: ${result.retryAfter}s`);
    }
    console.log();
  }

  console.log('\n🔐 Testing Auth Rate Limit (5 req/min)');
  console.log('─'.repeat(50));

  // Test auth rate limit
  for (let i = 1; i <= 7; i++) {
    const result = await rateLimitService.checkAuthRateLimit('192.168.1.1');
    console.log(`Auth Request ${i}:`);
    console.log(`  ${result.allowed ? '✓' : '✗'} Allowed: ${result.allowed}`);
    console.log(`  ✓ Remaining: ${result.remaining}`);
    if (result.retryAfter) {
      console.log(`  ⏱️  Retry After: ${result.retryAfter}s`);
    }
    console.log();
  }

  console.log('\n🧹 Cleaning up...');
  await rateLimitService.resetRateLimit('demo-user', {
    maxRequests: 100,
    windowMs: 60000,
    keyPrefix: 'rate_limit:general',
  });
  await rateLimitService.resetRateLimit('192.168.1.1', {
    maxRequests: 5,
    windowMs: 60000,
    keyPrefix: 'rate_limit:auth',
  });

  console.log('✅ Demo complete!');
  
  await redis.quit();
  process.exit(0);
}

demo().catch((error) => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
