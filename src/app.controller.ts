import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getCheck() {
    return { status: 'OK' };
  }

  @Public()
  @Head('health')
  healCheck() {}
}
