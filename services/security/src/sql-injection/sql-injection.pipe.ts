import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class SqlInjectionPipe implements PipeTransform {
  private readonly sqlInjectionPatterns: RegExp[] = [
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|TRUNCATE|REPLACE)\b/i, // Common SQL keywords
    /(--|#|\/\*|\*\/|;)/, // SQL comment indicators
    /\b(OR|AND)\s+\d+=\d+\b/i, // Boolean-based injections
    /\bWHERE\s+.*?=\s*.*?\s*(OR|AND)\s*\d+=\d+\b/i, // Injected conditions
  ];

  private detectSqlInjection(input: any): boolean {
    return typeof input === 'string' && this.sqlInjectionPatterns.some((pattern) => pattern.test(input));
  }

  transform(value: any) {
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (this.detectSqlInjection(value[key])) {
          console.warn(`🚨 SQL Injection Attempt Detected:`, value[key]);
          throw new BadRequestException(`SQL Injection detected in field: ${key}`);
        }
      }
    }
    return value; // ✅ Return value if no SQL injection is detected
  }
}
