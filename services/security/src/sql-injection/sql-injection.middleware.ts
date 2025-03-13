import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SqlInjectionMiddleware implements NestMiddleware {
  private readonly sqlInjectionPatterns: RegExp[] = [
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|TRUNCATE|REPLACE)\b/i, // Common SQL keywords
    /(--|#|\/\*|\*\/|;)/, // SQL comment indicators
    /\b(OR|AND)\s+\d+=\d+\b/i, // Boolean-based injections
    /\bWHERE\s+.*?=\s*.*?\s*(OR|AND)\s*\d+=\d+\b/i, // Injected conditions
  ];

  private detectSqlInjection(input: any): boolean {
    return typeof input === 'string' && this.sqlInjectionPatterns.some((pattern) => pattern.test(input));
  }

  private checkForInjection(obj: Record<string, any> | undefined, field: string) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (this.detectSqlInjection(obj[key])) {
        console.warn(`🚨 SQL Injection Attempt in ${field}:`, obj[key]);
        throw new BadRequestException(`SQL Injection detected in ${field}`);
      }
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.checkForInjection(req.query, 'Query Params');
      this.checkForInjection(req.body, 'Request Body');
      this.checkForInjection(req.params, 'URL Params');
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    next();
  }
}
