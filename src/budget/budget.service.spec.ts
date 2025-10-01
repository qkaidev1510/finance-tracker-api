import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BudgetService } from './budget.service';
import { Budget, Transaction } from 'src/entities';
import { CreateBudgetRequestDto } from 'src/dtos/create-budget-request.dto';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Helper: build a chainable QueryBuilder mock with a custom getRawOne return
function makeQB(returnTotal: string | null) {
  const qb: Partial<SelectQueryBuilder<Transaction>> & {
    select: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getRawOne: jest.Mock;
  } = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ total: returnTotal }),
  };
  return qb as unknown as SelectQueryBuilder<Transaction>;
}

describe('BudgetService', () => {
  let service: BudgetService;
  let budgetRepo: MockRepo<Budget>;
  let txRepo: MockRepo<Transaction>;

  beforeEach(async () => {
    budgetRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    txRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: getRepositoryToken(Budget), useValue: budgetRepo },
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
      ],
    }).compile();

    service = module.get(BudgetService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createBudget', () => {
    it('creates and saves a budget with provided userId and dto fields', async () => {
      const userId = 'user-1';
      const dto: CreateBudgetRequestDto = {
        category: 'Food' as any,
        limitAmount: 500,
        startDate: new Date('2024-01-01T00:00:00Z').toString(),
        endDate: new Date('2024-12-31T23:59:59Z').toString(),
      };

      const created = { id: 'b-1', user: { id: userId }, ...dto } as any;
      (budgetRepo.create as jest.Mock).mockReturnValue(created);
      (budgetRepo.save as jest.Mock).mockResolvedValue(created);

      const res = await service.createBudget(userId, dto);

      expect(budgetRepo.create).toHaveBeenCalledWith({
        user: { id: userId },
        category: dto.category,
        limitAmount: dto.limitAmount,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });
      expect(budgetRepo.save).toHaveBeenCalledWith(created);
      expect(res).toBe(created);
    });
  });

  describe('getBudgets', () => {
    it('finds budgets by user id', async () => {
      const userId = 'user-2';
      const rows = [{ id: 'b1' }, { id: 'b2' }] as any[];
      (budgetRepo.find as jest.Mock).mockResolvedValue(rows);

      const res = await service.getBudgets(userId);

      expect(budgetRepo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
      expect(res).toBe(rows);
    });
  });

  describe('getBudgetRemaining', () => {
    it('returns [] when no budgets found', async () => {
      (budgetRepo.find as jest.Mock).mockResolvedValue([]);

      const res = await service.getBudgetRemaining('user-3');

      expect(res).toEqual([]);
      expect(txRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('computes spent & remaining per budget category (with numeric coercion)', async () => {
      const userId = 'user-4';
      const budgets: Partial<Budget>[] = [
        {
          id: 'b1',
          user: { id: userId } as any,
          category: 'Food' as any,
          limitAmount: 1000 as any, // service casts to Number()
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T23:59:59Z'),
        },
        {
          id: 'b2',
          user: { id: userId } as any,
          category: 'Travel' as any,
          limitAmount: 300 as any,
          startDate: new Date('2024-02-01T00:00:00Z'),
          endDate: new Date('2024-02-28T23:59:59Z'),
        },
      ];
      (budgetRepo.find as jest.Mock).mockResolvedValue(budgets);

      // First budget spent = '250.75', second budget spent = null (treated as 0)
      const qb1 = makeQB('250.75');
      const qb2 = makeQB(null);

      (txRepo.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(qb1)
        .mockReturnValueOnce(qb2);

      const res = await service.getBudgetRemaining(userId);

      // Called twice (once per budget)
      expect(txRepo.createQueryBuilder).toHaveBeenCalledTimes(2);

      // Validate query filters are applied (spot-check one)
      expect((qb1 as any).where).toHaveBeenCalledWith('tx.userId = :userId', {
        userId,
      });
      expect((qb1 as any).andWhere).toHaveBeenCalledWith(
        'tx.category = :category',
        { category: budgets[0].category },
      );
      expect((qb2 as any).andWhere).toHaveBeenCalledWith(
        'tx.date BETWEEN :start AND :end',
        {
          start: budgets[1].startDate,
          end: budgets[1].endDate,
        },
      );

      // Validate computed summary
      expect(res).toEqual([
        {
          category: 'Food',
          limitAmount: 1000,
          spentAmount: 250.75,
          remainingAmount: 1000 - 250.75,
        },
        {
          category: 'Travel',
          limitAmount: 300,
          spentAmount: 0, // null -> 0
          remainingAmount: 300 - 0,
        },
      ]);
    });
  });
});
