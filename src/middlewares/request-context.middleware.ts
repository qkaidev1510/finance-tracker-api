import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

declare module 'http' {
  interface IncomingMessage {
    id?: string;
    startAt?: [number, number];
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerId = req.header('x-request-id');
    req.id = headerId || randomUUID();

    res.setHeader('x-request-id', req.id);
    req.startAt = process.hrtime();
    next();
  }
}
