import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap } from 'rxjs';
import { AppLoggerService } from 'src/logger/logger.service';

function getDurationMs(startAt?: [number, number]) {
  if (!startAt) return undefined;
  const diff = process.hrtime(startAt);
  return Math.round(diff[0] * 1e3 + diff[1] / 1e6);
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const path = req.originalUrl || req.url || '';
    const isHealthPath = path === '/health' || path.startsWith('/health');
    if (isHealthPath) return next.handle();

    const metaBase = {
      reqId: req.id,
      method: req.method,
      path,
      ip:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress,
      userId: (req as any).user?.userId ?? null,
      ua: req.headers['user-agent'],
    };

    this.logger.info('HTTP request', {
      ...metaBase,
      query: req.query,
      body: req.body,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = getDurationMs(req.startAt);
        const meta = {
          ...metaBase,
          status: res.statusCode,
          durationMs: duration,
          contentLength: res.getHeader('content-length'),
        };

        this.logger.info('HTTP response', meta);
      }),
      catchError((err) => {
        const duration = getDurationMs(req.startAt);
        const meta = {
          ...metaBase,
          status: err?.status ?? res.statusCode ?? 500,
          durationMs: duration,
        };

        this.logger.error('HTTP error', err?.stack, meta);
        throw err;
      }),
    );
  }
}
