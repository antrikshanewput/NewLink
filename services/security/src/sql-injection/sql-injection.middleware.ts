import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SqlInjectionMiddleware implements NestMiddleware {
  private readonly sqlInjectionPatterns: RegExp[] = [
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|TRUNCATE|REPLACE|WHERE)\b\s*/i,
    /(--|#|\/\*|\*\/|;)/, // SQL comment indicators
    /\b(OR|AND)\s*\d+\s*=\s*\d+\b/i, // Boolean-based injections
    /\b(?:SELECT\s*\*\s*FROM|DROP\s+TABLE|DELETE\s+FROM|UPDATE\s+\w+\s+SET)\b/i, // Enhanced patterns
  ];

  private detectSqlInjection(input: any): boolean {
    if (typeof input !== 'string') return false;
    const normalizedInput = input.toLowerCase().replace(/\s+/g, ' '); // Normalize spaces
    const hasInjection = this.sqlInjectionPatterns.some((pattern) => pattern.test(normalizedInput));
    
    if (hasInjection) {
      console.warn(`🚨 SQL Injection Detected: "${input}"`);
    }

    return hasInjection;
  }

  private checkForInjection(obj: any, field: string) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string' && this.detectSqlInjection(value)) {
        throw new BadRequestException(`SQL Injection detected in ${field}.${key}`);
      } else if (typeof value === 'object' && value !== null) {
        this.checkForInjection(value, `${field}.${key}`);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => this.checkForInjection(item, `${field}.${key}[${index}]`));
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
  
      this.checkForInjection(req.query, 'Query Params');
      this.checkForInjection(req.body, 'Request Body');
      this.checkForInjection(req.params, 'URL Params');
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  
    next();
  }
  
}
