import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, RegisterRequestDto } from 'src/dtos';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterRequestDto) {
    return this.authService.register(body.username, body.password);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginRequestDto) {
    return this.authService.login(body.username, body.password);
  }
}
