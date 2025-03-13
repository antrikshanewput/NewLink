import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import csurf from 'csurf';
import { SecurityOptions } from 'interface/security-config.interface';

export class CsrfMiddleware implements NestMiddleware {
  private csrfMiddleware;

  constructor(@Inject('SECURITY_OPTIONS') private securityOptions: SecurityOptions) {
    if (!this.securityOptions.csrfProtection?.cookie || !this.securityOptions.csrfProtection.secret) {
      throw new Error('CSRF Middleware is misconfigured. Missing secret.');
    }

    this.csrfMiddleware = csurf({
      cookie: this.securityOptions.csrfProtection.cookie,
      secret: this.securityOptions.csrfProtection.secret,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.csrfMiddleware(req, res, (err) => {
      if (err) {
        console.error('CSRF Middleware Error:', err);
        res.status(403).send('CSRF token validation failed');
      } else {
        next();
      }
    });
  }
}
