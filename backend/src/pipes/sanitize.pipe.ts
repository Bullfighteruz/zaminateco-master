import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize input to prevent XSS attacks
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'string') {
            sanitized[key] = DOMPurify.sanitize(value);
          } else if (typeof value === 'object') {
            sanitized[key] = this.sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
      }
      return sanitized;
    }

    return obj;
  }
}

