import { Injectable } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class XssService {
  // Sanitize a single input string
  sanitizeInput(input: string): string {
    return xss(input);
  }

  // Sanitize an entire object recursively
  sanitizeObject(obj: Record<string, any>): Record<string, any> {
    if (!obj || typeof obj !== 'object') return obj;

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        obj[key] = this.sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = this.sanitizeObject(obj[key]); // Recursive sanitization
      }
    });

    return obj;
  }
}
