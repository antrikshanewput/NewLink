import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

@Injectable()
export class XssMiddleware implements NestMiddleware {
  private detectXss(input: any): boolean {
    if (typeof input !== 'string') return false;
    
    const sanitized = xss(input); // Sanitize input
    return sanitized !== input; // If sanitization changes the input, XSS was detected
  }

  private checkForXss(obj: Record<string, any> | undefined, field: string) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (this.detectXss(obj[key])) {
        console.warn(`🚨 XSS Attempt Detected in ${field}:`, obj[key]);
        throw new BadRequestException(`Potential XSS attack detected in ${field}`);
      }
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
        } catch (e) {
          console.error('❌ Failed to parse JSON body:', e);
        }
      }
      this.checkForXss(req.query, 'Query Params');
      this.checkForXss(req.body, 'Request Body');
      this.checkForXss(req.params, 'URL Params');
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    next();
  }
}
