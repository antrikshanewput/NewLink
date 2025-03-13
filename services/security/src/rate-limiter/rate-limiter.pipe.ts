import { Injectable, PipeTransform, BadRequestException, Inject } from '@nestjs/common';
import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { SecurityOptions } from 'interface/security-config.interface';

@Injectable()
export class RateLimitPipe implements PipeTransform {
  private rateLimiter;

  constructor(@Inject('SECURITY_OPTIONS') private readonly options: SecurityOptions) {
    if (!this.options.rateLimiter?.windowMs || !this.options.rateLimiter?.maxRequests) {
      throw new Error('Rate Limiter Pipe is misconfigured. Missing required settings.');
    }

    this.rateLimiter = rateLimit({
      windowMs: this.options.rateLimiter.windowMs, // Window duration
      max: this.options.rateLimiter.maxRequests, // Max requests per window
      message: 'Too many requests, please try again later.',
      headers: true, // Send rate limit headers
      keyGenerator: (req) => req.ip, // Rate limit per IP address
    });
  }

  async transform(value: any) {
    const req = value as Request; // Ensure we handle the Express request

    return new Promise((resolve, reject) => {
      this.rateLimiter(req, req.res as any, (err) => {
        if (err) {
          console.error('🚨 Rate Limit Exceeded:', err);
          reject(new BadRequestException('Too many requests, please try again later.'));
        } else {
          resolve(value); // ✅ Pass validated data
        }
      });
    });
  }
}
