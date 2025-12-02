import { Module, Global } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RateLimitService } from './rate-limit.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
      }),
    }),
  ],
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule {}
