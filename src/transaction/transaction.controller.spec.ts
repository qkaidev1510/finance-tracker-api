import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTransactionRequestDto } from 'src/dtos';
import { ICurrentUser } from 'src/interfaces/current-user.interface';
import { Transaction } from 'src/entities/transaction.entity';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockUser: ICurrentUser = { userId: 'u-1', username: 'alice' } as any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [{ provide: TransactionService, useValue: service }],
    })
      // Bypass the real guard for unit tests
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(TransactionController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /transaction', () => {
    it('calls service.create with dto and userId and returns result', async () => {
      const dto: CreateTransactionRequestDto = {
        amount: 12.34 as any, // adjust type if amount is string/number in your DTO
        category: 'Food' as any, // adjust enum types as needed
        type: 'EXPENSE' as any,
        note: 'lunch',
      };
      const created = { id: 'tx-1', ...dto, userId: mockUser.userId };
      service.create.mockResolvedValueOnce(created);

      const res = await controller.create(dto as any, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser.userId);
      expect(res).toBe(created);
    });

    it('propagates errors from service.create', async () => {
      const dto = {
        amount: 1,
        category: 'Food',
        type: 'EXPENSE',
        note: '',
      } as any;
      service.create.mockRejectedValueOnce(new Error('create failed'));

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        'create failed',
      );
    });
  });

  describe('GET /transaction', () => {
    it('calls service.findAll with userId and returns list', async () => {
      const rows = [{ id: 'tx-1' }, { id: 'tx-2' }];
      service.findAll.mockResolvedValueOnce(rows);

      const res = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.userId);
      expect(res).toBe(rows);
    });
  });

  describe('PUT /transaction/:id', () => {
    it('calls service.update with id and patch and returns updated', async () => {
      const id = 'tx-99';
      const patch: Partial<Transaction> = { note: 'updated' };
      const updated = { id, ...patch };
      service.update.mockResolvedValueOnce(updated);

      const res = await controller.update(id, patch);

      expect(service.update).toHaveBeenCalledWith(id, patch);
      expect(res).toBe(updated);
    });

    it('propagates errors from service.update', async () => {
      const id = 'tx-1';
      const patch = { note: 'x' } as any;
      service.update.mockRejectedValueOnce(new Error('update failed'));

      await expect(controller.update(id, patch)).rejects.toThrow(
        'update failed',
      );
    });
  });

  describe('DELETE /transaction/:id', () => {
    it('calls service.remove with id and returns result', async () => {
      const id = 'tx-77';
      const del = { affected: 1 };
      service.remove.mockResolvedValueOnce(del);

      const res = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(res).toBe(del);
    });
  });
});
