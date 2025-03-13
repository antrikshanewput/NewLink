import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { SecurityOptions } from 'interface/security-config.interface';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private rateLimiter;

  constructor(@Inject('SECURITY_OPTIONS') private readonly options: SecurityOptions) {
    this.rateLimiter = rateLimit({
      windowMs: this.options.rateLimiter.windowMs, // Window duration
      max: this.options.rateLimiter.maxRequests, // Max requests per window
      message: 'Too many requests, please try again later.',
      headers: true, // Send rate limit headers
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.rateLimiter(req, res, next);
  }
}
