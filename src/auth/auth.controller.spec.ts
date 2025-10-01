import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('POST /auth/register', () => {
    it('calls AuthService.register with username & password and returns result', async () => {
      const body = { username: 'alice', password: 'secret' };
      const createdUser = { id: 'u1', username: 'alice' };
      service.register.mockResolvedValueOnce(createdUser);

      const result = await controller.register(body as any);

      expect(service.register).toHaveBeenCalledWith('alice', 'secret');
      expect(result).toBe(createdUser);
    });

    it('propagates errors from AuthService.register', async () => {
      const body = { username: 'bob', password: 'pwd' };
      service.register.mockRejectedValueOnce(new Error('duplicate'));

      await expect(controller.register(body as any)).rejects.toThrow(
        'duplicate',
      );
    });
  });

  describe('POST /auth/login', () => {
    it('calls AuthService.login with username & password and returns token', async () => {
      const body = { username: 'alice', password: 'secret' };
      const token = { access_token: 'jwt.token' };
      service.login.mockResolvedValueOnce(token);

      const result = await controller.login(body as any);

      expect(service.login).toHaveBeenCalledWith('alice', 'secret');
      expect(result).toBe(token);
    });

    it('propagates errors from AuthService.login', async () => {
      const body = { username: 'eve', password: 'bad' };
      service.login.mockRejectedValueOnce(new Error('Invalid'));

      await expect(controller.login(body as any)).rejects.toThrow('Invalid');
    });
  });
});
