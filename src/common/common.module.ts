import { Module, Global } from '@nestjs/common';
import { LoggingService } from './services/logging.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { RedisService } from './services/redis.service';
import { ConfigService } from '../config/services/config.service';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  providers: [LoggingService, RateLimiterService, RedisService, ConfigService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }],
  exports: [LoggingService, RateLimiterService, RedisService, ThrottlerModule],
})
export class CommonModule { }