import { Test, TestingModule } from '@nestjs/testing';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateBudgetRequestDto } from 'src/dtos/create-budget-request.dto';
import { ICurrentUser } from 'src/interfaces/current-user.interface';

describe('BudgetController', () => {
  let controller: BudgetController;
  let service: {
    createBudget: jest.Mock;
    getBudgets: jest.Mock;
    getBudgetRemaining: jest.Mock;
  };

  const mockUser: ICurrentUser = {
    userId: 'user-123',
    username: 'alice',
  } as any;

  beforeEach(async () => {
    service = {
      createBudget: jest.fn(),
      getBudgets: jest.fn(),
      getBudgetRemaining: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [{ provide: BudgetService, useValue: service }],
    })
      // Bypass the real guard in unit tests
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(BudgetController);
  });

  describe('POST /budget', () => {
    it('calls service.createBudget with userId and dto and returns result', async () => {
      const dto: CreateBudgetRequestDto = {
        category: 'Food' as any,
        limitAmount: 500,
        startDate: new Date('2024-01-01T00:00:00Z').toString(),
        endDate: new Date('2024-12-31T23:59:59Z').toString(),
      };

      const created = { id: 'b1', ...dto, user: { id: mockUser.userId } };
      service.createBudget.mockResolvedValueOnce(created);

      const result = await controller.createBudget(mockUser, dto);

      expect(service.createBudget).toHaveBeenCalledWith(mockUser.userId, dto);
      expect(result).toBe(created);
    });

    it('propagates errors from service.createBudget', async () => {
      const dto = {
        category: 'Food',
        limitAmount: 100,
        startDate: new Date(),
        endDate: new Date(),
      } as any;
      service.createBudget.mockRejectedValueOnce(new Error('boom'));

      await expect(controller.createBudget(mockUser, dto)).rejects.toThrow(
        'boom',
      );
    });
  });

  describe('GET /budget', () => {
    it('calls service.getBudgets with userId and returns rows', async () => {
      const rows = [{ id: 'b1' }, { id: 'b2' }];
      service.getBudgets.mockResolvedValueOnce(rows);

      const result = await controller.getBudget(mockUser);

      expect(service.getBudgets).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toBe(rows);
    });
  });

  describe('GET /budget/remaining', () => {
    it('calls service.getBudgetRemaining with userId and returns summaries', async () => {
      const summaries = [
        {
          category: 'Food',
          limitAmount: 500,
          spentAmount: 120,
          remainingAmount: 380,
        },
      ];
      service.getBudgetRemaining.mockResolvedValueOnce(summaries);

      const result = await controller.getRemaining(mockUser);

      expect(service.getBudgetRemaining).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toBe(summaries);
    });
  });
});
