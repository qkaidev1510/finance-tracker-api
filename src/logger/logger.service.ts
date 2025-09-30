import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logBase(level: LogLevel, msg: string, meta?: Record<string, any>) {
    const safeMeta = meta
      ? JSON.parse(
          JSON.stringify(meta, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v,
          ),
        )
      : undefined;

    const line = {
      ts: new Date().toString(),
      level,
      msg,
      ...safeMeta,
    };

    const out = JSON.stringify(line);

    switch (level) {
      case 'debug':
        console.debug(out);
        break;
      case 'info':
        console.info(out);
        break;
      case 'warn':
        console.warn(out);
        break;
      case 'error':
        console.error(out);
        break;
    }
  }

  log(message: any, meta?: Record<string, any>) {
    this.logBase('info', message, meta);
  }
  info(message: any, meta?: Record<string, any>) {
    this.logBase('info', message, meta);
  }
  error(message: any, trace?: string, meta?: Record<string, any>) {
    this.logBase('error', message, { ...meta, trace });
  }
  warn(message: any, meta?: Record<string, any>) {
    this.logBase('warn', message, meta);
  }
  debug(message: any, meta?: Record<string, any>) {
    this.logBase('debug', message, meta);
  }
  verbose(message: any, meta?: Record<string, any>) {
    this.logBase('debug', message, meta);
  }
}
