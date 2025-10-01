import { of, throwError, lastValueFrom } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { AppLoggerService } from 'src/logger/logger.service';

describe('RequestLoggingInterceptor', () => {
  let interceptor: RequestLoggingInterceptor;
  let logger: { info: jest.Mock; error: jest.Mock };

  // Shared mocks
  let req: any;
  let res: any;
  let context: ExecutionContext;

  const makeContext = (request: any, response: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    interceptor = new RequestLoggingInterceptor(
      logger as unknown as AppLoggerService,
    );

    req = {
      id: 'req-123',
      method: 'GET',
      url: '/api/things',
      originalUrl: undefined,
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'JestTest',
      },
      socket: { remoteAddress: '127.0.0.1' },
      query: { q: 'x' },
      body: { a: 1 },
      startAt: [1, 2], // hrtime tuple set by middleware
      user: { userId: 'user-abc' },
    };

    res = {
      statusCode: 200,
      getHeader: jest.fn().mockReturnValue('123'),
    };

    context = makeContext(req, res);

    // Make duration deterministic: process.hrtime(startAt) -> [0 sec, 5_000_000 ns] = 5ms
    jest
      .spyOn(process, 'hrtime')
      .mockImplementation((start?: [number, number]) => {
        if (start) return [0, 5_000_000] as [number, number];
        return [0, 0] as [number, number];
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bypasses logging for /health paths', async () => {
    req.url = '/health';
    const next: CallHandler = { handle: jest.fn(() => of('ok')) } as any;

    const result = await lastValueFrom(
      interceptor.intercept(context, next) as any, // Observable
    );

    expect(result).toBe('ok');
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });

  it('logs request and response on success, including duration and content-length', async () => {
    const next: CallHandler = {
      handle: jest.fn(() => of({ ok: true })),
    } as any;

    const result = await lastValueFrom(
      interceptor.intercept(context, next) as any,
    );

    expect(result).toEqual({ ok: true });

    // First log: HTTP request
    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      'HTTP request',
      expect.objectContaining({
        reqId: 'req-123',
        method: 'GET',
        path: '/api/things',
        ip: '1.2.3.4',
        userId: 'user-abc',
        ua: 'JestTest',
        query: { q: 'x' },
        body: { a: 1 },
      }),
    );

    // Second log: HTTP response with status, duration, contentLength
    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      'HTTP response',
      expect.objectContaining({
        reqId: 'req-123',
        method: 'GET',
        path: '/api/things',
        status: 200,
        durationMs: 5, // from mocked hrtime
        contentLength: '123', // from res.getHeader
      }),
    );
  });

  it('logs error on failure with status and duration, then rethrows', async () => {
    const err = Object.assign(new Error('fail!'), {
      status: 418,
      stack: 'stack-trace',
    });
    const next: CallHandler = {
      handle: jest.fn(() => throwError(() => err)),
    } as any;

    await expect(
      lastValueFrom(interceptor.intercept(context, next) as any),
    ).rejects.toThrow('fail!');

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP error',
      'stack-trace',
      expect.objectContaining({
        reqId: 'req-123',
        method: 'GET',
        path: '/api/things',
        status: 418,
        durationMs: 5,
      }),
    );
  });
});
