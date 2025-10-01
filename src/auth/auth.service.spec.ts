import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-123',
    username: 'alice',
    pwdHash: 'pass',
  };

  const mockUserService = {
    register: jest.fn(),
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('delegates to userService.register and returns new user', async () => {
      const newUser = {
        id: 'u1',
        username: 'bob',
        pwdHash: 'x',
      };

      userService.register.mockResolvedValueOnce(newUser as any);

      const res = await service.register('bob', 'secret');

      expect(userService.register).toHaveBeenCalledWith('bob', 'secret');
      expect(res).toBe(newUser);
    });
  });

  describe('login', () => {
    it('returns access_token on success', async () => {
      userService.findByUsername.mockResolvedValueOnce(mockUser as any);
      jwtService.sign.mockReturnValueOnce('signed.jwt.token');

      const res = await service.login('alice', 'pass');

      expect(userService.findByUsername).toHaveBeenCalledWith('alice');
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'alice',
        sub: 'user-123',
      });
      expect(res).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('returns undefined and logs when user not found', async () => {
      userService.findByUsername.mockResolvedValueOnce(null as any);

      const res = await service.login('ghost', 'whatever');

      expect(userService.findByUsername).toHaveBeenCalledWith('ghost');
      expect(res).toBeUndefined();
      expect(console.log).toHaveBeenCalled();
    });

    it('returns undefined and logs when password mismatch', async () => {
      userService.findByUsername.mockResolvedValueOnce({
        ...mockUser,
        pwdHash: 'correct',
      });

      const res = await service.login('alice', 'wrongPassword');

      expect(userService.findByUsername).toHaveBeenCalledWith('alice');
      expect(res).toBeUndefined();
      expect(console.log).toHaveBeenCalled();
    });
  });
});
