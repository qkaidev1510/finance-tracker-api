import { AppLoggerService } from './logger.service';

describe('AppLoggerService', () => {
  let service: AppLoggerService;

  beforeEach(() => {
    service = new AppLoggerService();
    jest.spyOn(global.console, 'debug').mockImplementation(() => {});
    jest.spyOn(global.console, 'info').mockImplementation(() => {});
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('log() calls console.info with JSON string containing msg and level', () => {
    service.log('hello');
    expect(console.info).toHaveBeenCalledTimes(1);

    const arg = (console.info as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.msg).toBe('hello');
    expect(parsed.level).toBe('info');
    expect(typeof parsed.ts).toBe('string');
  });

  it('info() behaves same as log()', () => {
    service.info('world', { foo: 'bar' });
    const arg = (console.info as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.msg).toBe('world');
    expect(parsed.level).toBe('info');
    expect(parsed.foo).toBe('bar');
  });

  it('warn() calls console.warn with metadata', () => {
    service.warn('caution', { foo: 123 });
    const arg = (console.warn as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.msg).toBe('caution');
    expect(parsed.level).toBe('warn');
    expect(parsed.foo).toBe(123);
  });

  it('error() calls console.error with trace merged into metadata', () => {
    service.error('boom', 'stack-trace', { foo: 'bar' });
    const arg = (console.error as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.msg).toBe('boom');
    expect(parsed.level).toBe('error');
    expect(parsed.trace).toBe('stack-trace');
    expect(parsed.foo).toBe('bar');
  });

  it('debug() calls console.debug', () => {
    service.debug('dbg', { key: 'val' });
    const arg = (console.debug as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.msg).toBe('dbg');
    expect(parsed.level).toBe('debug');
    expect(parsed.key).toBe('val');
  });

  it('verbose() is alias for debug()', () => {
    service.verbose('details');
    expect(console.debug).toHaveBeenCalledTimes(1);
    const arg = (console.debug as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.level).toBe('debug');
    expect(parsed.msg).toBe('details');
  });

  it('handles bigint metadata safely', () => {
    service.info('test', { big: BigInt(12345) });
    const arg = (console.info as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(arg);

    expect(parsed.big).toBe('12345'); // bigint converted to string
  });
});
