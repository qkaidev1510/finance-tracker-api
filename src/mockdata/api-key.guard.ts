import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('API_KEY');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new ForbiddenException('API key is missing');
    }

    if (apiKey != this.apiKey) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
