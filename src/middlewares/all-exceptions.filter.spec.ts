import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  // Shared HTTP mocks
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let response: any;
  let request: any;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    response = { status: statusMock, json: jsonMock };
    request = { url: '/test-path' };

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles HttpException: uses its status and message', () => {
    // Using BadRequestException so getResponse().message exists
    const ex = new BadRequestException('Invalid payload');

    filter.catch(ex, host);

    expect(Logger.prototype.error).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(jsonMock).toHaveBeenCalledTimes(1);
    const body = jsonMock.mock.calls[0][0];

    expect(body).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test-path',
      message: 'Invalid payload',
    });
  });

  it('falls back to exception.message when getResponse() is a string', () => {
    // HttpException with string response (no .message field on getResponse())
    const ex = new HttpException('Teapot!', 418);

    filter.catch(ex, host);

    expect(statusMock).toHaveBeenCalledWith(418);
    const body = jsonMock.mock.calls[0][0];

    expect(body.statusCode).toBe(418);
    expect(body.path).toBe('/test-path');
    expect(body.message).toBe('Teapot!'); // from exception.message
    expect(typeof body.timestamp).toBe('string');
  });

  it('handles non-HttpException: returns 500 and generic message', () => {
    const ex = new Error('Unexpected boom');

    filter.catch(ex, host);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Unexpected boom',
      expect.any(String),
    );
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    const body = jsonMock.mock.calls[0][0];
    expect(body).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test-path',
      message: 'Internal server error',
    });
  });
});
