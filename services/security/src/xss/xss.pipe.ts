import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class XssPipe implements PipeTransform {
  private detectXss(input: any): boolean {
    if (typeof input !== 'string') return false;
    
    const sanitized = xss(input); // Sanitize input
    return sanitized !== input; // If sanitization changes the input, XSS was detected
  }

  transform(value: any) {
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (this.detectXss(value[key])) {
          console.warn(`🚨 XSS Attempt Detected:`, { key, value: value[key] });
          throw new BadRequestException(`Potential XSS attack detected in field: ${key}`);
        }
      }
    }

    return value; // ✅ Return the sanitized value
  }
}
