import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { CreateTransactionRequestDto } from 'src/dtos';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TransactionService', () => {
  let service: TransactionService;
  let txRepo: MockRepo<Transaction>;
  let userRepo: MockRepo<User>;
  let cacheManager: any;

  const userId = 'user-123';
  const mockUser: Partial<User> = { id: userId, username: 'alice' };

  const dto: CreateTransactionRequestDto = {
    amount: '123.45' as any, // adapt if your dto uses number/string for numeric
    category: 'Food' as any, // adapt enum type if you have one
    type: 'EXPENSE' as any, // adapt enum type if you have one
    note: 'lunch',
  };

  beforeEach(async () => {
    txRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get(TransactionService);
  });

  describe('create', () => {
    it('creates and saves a new transaction for the user', async () => {
      userRepo.findOne!.mockResolvedValueOnce(mockUser);

      // Make create echo back an entity-like object
      txRepo.create!.mockImplementation((input) => ({ id: 'tx-1', ...input }));
      const persisted = {
        id: 'tx-1',
        ...dto,
        user: mockUser,
        date: new Date(),
      } as any;
      txRepo.save!.mockResolvedValueOnce(persisted);

      const result = await service.create(dto, userId);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: { pwdHash: false },
      });

      // Check that create was called with the mapped fields and a Date
      expect(txRepo.create).toHaveBeenCalledWith({
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        note: dto.note,
        user: mockUser,
        date: expect.any(Date),
      });

      expect(txRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'tx-1' }),
      );
      expect(result).toBe(persisted);
    });

    it('still creates a transaction even if user lookup returns null (current implementation)', async () => {
      userRepo.findOne!.mockResolvedValueOnce(null);

      txRepo.create!.mockImplementation((input) => ({ id: 'tx-2', ...input }));
      const persisted = {
        id: 'tx-2',
        ...dto,
        user: null,
        date: new Date(),
      } as any;
      txRepo.save!.mockResolvedValueOnce(persisted);

      const result = await service.create(dto, userId);

      expect(userRepo.findOne).toHaveBeenCalled();
      expect(txRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: null, date: expect.any(Date) }),
      );
      expect(txRepo.save).toHaveBeenCalled();
      expect(result).toBe(persisted);
    });
  });

  describe('findAll', () => {
    it('returns transactions filtered by userId', async () => {
      const items = [{ id: 'tx-1' }, { id: 'tx-2' }] as any[];
      txRepo.find!.mockResolvedValueOnce(items);

      const result = await service.findAll(userId);

      expect(txRepo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        take: 1000000,
      });
      expect(result).toBe(items);
    });
  });

  describe('update', () => {
    it('updates and returns the updated transaction', async () => {
      const txId = 'tx-99';
      const patch: Partial<Transaction> = { note: 'updated note' };

      txRepo.update!.mockResolvedValueOnce({ affected: 1 } as UpdateResult);
      const updated = { id: txId, ...patch } as any;
      txRepo.findOne!.mockResolvedValueOnce(updated);

      const result = await service.update(txId, patch);

      expect(txRepo.update).toHaveBeenCalledWith(txId, patch);
      expect(txRepo.findOne).toHaveBeenCalledWith({ where: { id: txId } });
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('deletes a transaction', async () => {
      const txId = 'tx-77';
      const del: DeleteResult = { affected: 1, raw: [] };
      txRepo.delete!.mockResolvedValueOnce(del);

      const result = await service.remove(txId);

      expect(txRepo.delete).toHaveBeenCalledWith(txId);
      expect(result).toBe(del);
    });
  });
});
