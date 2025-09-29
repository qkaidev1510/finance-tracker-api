import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getRoot() {
    return { status: 'OK' };
  }

  @Public()
  @Head()
  root() {}

  @Public()
  @Get('health')
  getCheck() {
    return { status: 'OK' };
  }

  @Public()
  @Head('health')
  healCheck() {}
}
