import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, user } = request;
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || '';

    const sensitiveActions = [
      'DELETE',
      'POST',
      'PUT',
      'PATCH',
    ];

    const sensitiveEndpoints = [
      '/users',
      '/projects',
      '/donations',
      '/orders',
      '/admin',
    ];

    const shouldLog = sensitiveActions.includes(method) &&
      sensitiveEndpoints.some(endpoint => url.includes(endpoint));

    if (shouldLog) {
      const entity = this.extractEntity(url);
      const action = this.extractAction(method);

      // Log asynchronously to avoid blocking request
      this.logAudit({
        userId: user?.userId,
        action,
        entity,
        entityId: params?.id || body?.id,
        changes: this.sanitizeChanges(body),
        ipAddress,
        userAgent,
      }).catch(console.error);
    }

    return next.handle();
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[1] || 'unknown';
  }

  private extractAction(method: string): string {
    const methodMap: Record<string, string> = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return methodMap[method] || method.toLowerCase();
  }

  private sanitizeChanges(body: any): any {
    if (!body) return null;

    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
    const sanitized = { ...body };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private async logAudit(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}

