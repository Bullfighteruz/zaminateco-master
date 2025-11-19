import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Enhanced rate limiting middleware
 * Applies different limits based on endpoint and user role
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limits: Map<string, { count: number; window: number }> = new Map();
  private readonly userLimits: Map<string, Map<string, { count: number; resetAt: number }>> = new Map();

  use(req: Request, res: Response, next: NextFunction) {
    const endpoint = req.path;
    const userId = (req as any).user?.userId || req.ip;

    // Define rate limits per endpoint
    const endpointLimits: Record<string, { count: number; window: number }> = {
      '/api/v1/auth/register': { count: 5, window: 3600000 }, // 5 per hour
      '/api/v1/auth/login': { count: 10, window: 900000 }, // 10 per 15 min
      '/api/v1/auth/verify-otp': { count: 5, window: 300000 }, // 5 per 5 min
      '/api/v1/projects': { count: 100, window: 60000 }, // 100 per minute
      '/api/v1/projects/:id/vote': { count: 10, window: 60000 }, // 10 votes per minute
      '/api/v1/projects/:id/donate': { count: 5, window: 60000 }, // 5 donations per minute
      '/api/v1/collections': { count: 20, window: 60000 }, // 20 per minute
    };

    // Find matching limit
    let limit = endpointLimits[endpoint];
    if (!limit) {
      // Try pattern matching
      for (const [pattern, lim] of Object.entries(endpointLimits)) {
        if (this.matchesPattern(endpoint, pattern)) {
          limit = lim;
          break;
        }
      }
    }

    // Default limit if none found
    if (!limit) {
      limit = { count: 100, window: 60000 }; // 100 per minute default
    }

    // Check rate limit
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const userLimit = this.userLimits.get(userId) || new Map();
    const endpointLimit = userLimit.get(endpoint) || { count: 0, resetAt: now + limit.window };

    if (endpointLimit.resetAt < now) {
      endpointLimit.count = 0;
      endpointLimit.resetAt = now + limit.window;
    }

    if (endpointLimit.count >= limit.count) {
      const retryAfter = Math.ceil((endpointLimit.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    endpointLimit.count++;
    userLimit.set(endpoint, endpointLimit);
    this.userLimits.set(userId, userLimit);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    next();
  }

  private matchesPattern(path: string, pattern: string): boolean {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        continue; // Wildcard match
      }
      if (patternParts[i] !== pathParts[i]) {
        return false;
      }
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [userId, limits] of this.userLimits.entries()) {
      for (const [endpoint, limit] of limits.entries()) {
        if (limit.resetAt < now) {
          limits.delete(endpoint);
        }
      }
      if (limits.size === 0) {
        this.userLimits.delete(userId);
      }
    }
  }
}

