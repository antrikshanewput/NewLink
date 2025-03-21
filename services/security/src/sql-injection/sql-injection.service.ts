import { Injectable } from '@nestjs/common';
import * as SqlString from 'sqlstring';

@Injectable()
export class SqlInjectionService {
  // Escapes SQL inputs to prevent SQL Injection attacks
  escapeSQLInput(input: string): string {
    return SqlString.escape(input);
  }

  // Sanitizes an entire object
  sanitizeObject(obj: Record<string, any>): Record<string, any> {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        obj[key] = this.escapeSQLInput(obj[key]);
      }
    });
    return obj;
  }
}
