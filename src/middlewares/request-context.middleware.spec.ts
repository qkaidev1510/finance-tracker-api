import { RequestContextMiddleware } from './request-context.middleware';
import * as crypto from 'crypto';

describe('RequestContextMiddleware', () => {
  let middleware: RequestContextMiddleware;

  // Common mocks
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RequestContextMiddleware();

    req = {
      header: jest.fn(),
      // will be filled by middleware: id, startAt
    };

    res = {
      setHeader: jest.fn(),
    };

    next = jest.fn();

    // Make hrtime deterministic for assertions
    jest.spyOn(process, 'hrtime').mockReturnValue([1, 2] as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses x-request-id header when present', () => {
    req.header.mockReturnValue('abcd1234-1111-2222-3333-444455556666'); // valid UUID string

    const uuidSpy = jest.spyOn(crypto, 'randomUUID');

    middleware.use(req, res, next);

    expect(req.header).toHaveBeenCalledWith('x-request-id');
    expect(uuidSpy).not.toHaveBeenCalled(); // randomUUID should not be used

    expect(req.id).toBe('abcd1234-1111-2222-3333-444455556666');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'abcd1234-1111-2222-3333-444455556666',
    );
    expect(req.startAt).toEqual([1, 2]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a request id when header is missing', () => {
    req.header.mockReturnValue(undefined);

    const fakeUuid: ReturnType<typeof crypto.randomUUID> =
      '11111111-1111-1111-1111-111111111111';

    const uuidSpy = jest.spyOn(crypto, 'randomUUID').mockReturnValue(fakeUuid);

    middleware.use(req, res, next);

    expect(uuidSpy).toHaveBeenCalledTimes(1);
    expect(req.id).toBe(fakeUuid);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', fakeUuid);
    expect(req.startAt).toEqual([1, 2]);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
