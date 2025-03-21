import { Injectable, PipeTransform, BadRequestException, Inject } from '@nestjs/common';
import csurf from 'csurf';
import { Request } from 'express';
import { SecurityOptions } from 'interface/security-config.interface';

@Injectable()
export class CsrfPipe implements PipeTransform {
  private csrfMiddleware;

  constructor(@Inject('SECURITY_OPTIONS') private securityOptions: SecurityOptions) {
    if (!this.securityOptions.csrfProtection?.cookie || !this.securityOptions.csrfProtection.secret) {
      throw new Error('CSRF Pipe is misconfigured. Missing secret.');
    }

    this.csrfMiddleware = csurf({
      cookie: this.securityOptions.csrfProtection.cookie,
      secret: this.securityOptions.csrfProtection.secret,
    });
  }

  async transform(value: any, { metatype, data, type }: { metatype?: any; data?: string; type?: string }) {
    const req = value as Request; // Ensure we are handling the Express request

    return new Promise((resolve, reject) => {
      this.csrfMiddleware(req, req.res as any, (err) => {
        if (err) {
          console.error('🚨 CSRF Validation Failed:', err);
          reject(new BadRequestException('CSRF token validation failed'));
        } else {
          resolve(value); // ✅ Pass validated data
        }
      });
    });
  }
}
