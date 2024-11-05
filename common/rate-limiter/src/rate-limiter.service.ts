import { Injectable } from '@nestjs/common';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterService {

  constructor(private configService: ConfigService) {
  }
  /**
   * Returns custom throttle options for specific routes or controllers.
   * @param limit - Maximum number of requests.
   * @param ttl - Time-to-live (TTL) in seconds for rate limiting.
   * @returns ThrottlerModuleOptions with custom settings.
   */
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

  /**
   * Returns default rate limiting options.
   * This could be configured to fetch environment-based defaults if needed.
   * @returns Default ThrottlerModuleOptions.
   */
  getDefaultRateLimitOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          ttl: this.configService.get<number>('RATE_LIMIT_TTL', 60),
          limit: this.configService.get<number>('RATE_LIMIT_LIMIT', 10),
        }
      ]
    };
  }
}