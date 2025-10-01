import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let userRepo: MockRepo<User>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('creates and saves a new user when username is not taken', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValueOnce(null); // no existing user

      const created = { id: 'u1', username: 'alice', pwdHash: 'secret' } as any;
      (userRepo.create as jest.Mock).mockReturnValue(created);
      (userRepo.save as jest.Mock).mockResolvedValue(created);

      const res = await service.register('alice', 'secret');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'alice' },
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'alice',
        pwdHash: 'secret',
      });
      expect(userRepo.save).toHaveBeenCalledWith(created);
      expect(res).toBe(created);
    });

    it('throws if username already exists', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValueOnce({
        id: 'u1',
        username: 'alice',
      });

      await expect(service.register('alice', 'secret')).rejects.toThrow(
        'Username Already Existed',
      );

      expect(userRepo.create).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('returns user by username', async () => {
      const user = { id: 'u2', username: 'bob' } as any;
      (userRepo.findOne as jest.Mock).mockResolvedValueOnce(user);

      const res = await service.findByUsername('bob');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'bob' },
      });
      expect(res).toBe(user);
    });
  });

  describe('findById', () => {
    it('returns user by id', async () => {
      const user = { id: 'u3', username: 'carol' } as any;
      (userRepo.findOne as jest.Mock).mockResolvedValueOnce(user);

      const res = await service.findById('u3');

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 'u3' } });
      expect(res).toBe(user);
    });
  });
});
