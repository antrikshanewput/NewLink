import { Injectable } from '@nestjs/common';
import { ThrottlerModuleOptions, Throttle } from '@nestjs/throttler';
import { ConfigService } from '../../config/services/config.service';

@Injectable()
export class RateLimiterService {
  constructor(private readonly configService: ConfigService) { }

  // Retrieves a ThrottlerModuleOptions object for custom rate limit configurations
  getCustomThrottleOptions(limit: number, ttl: number): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl,
          limit,
        },
      ],
    };
  }

  // Retrieves default rate limiting settings using values from ConfigService
  getDefaultRateLimitOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl: this.configService.getRateLimitTTL(),
          limit: this.configService.getRateLimitCount(),
        },
      ],
    };
  }
}