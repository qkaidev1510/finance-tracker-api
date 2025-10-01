import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SummaryService } from './summary.service';
import { Transaction, ETransactionType } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('SummaryService', () => {
  let service: SummaryService;
  let txRepo: MockRepo<Transaction>;

  const user: User = { id: 'u-1' } as any;

  beforeEach(async () => {
    txRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
      ],
    }).compile();

    service = module.get(SummaryService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getMonthlySummary', () => {
    it('sums income and expense and returns net balance', async () => {
      // Arrange: two income, one expense
      const txns: Partial<Transaction>[] = [
        { amount: 100, type: ETransactionType.Income },
        { amount: 50, type: ETransactionType.Expense },
        { amount: 25, type: ETransactionType.Income },
      ];
      (txRepo.find as jest.Mock).mockResolvedValue(txns);

      // Act
      const res = await service.getMonthlySummary(user, {
        month: '2024-05',
      } as any);

      // Assert: totals
      expect(res).toEqual({
        totalIncome: 125,
        totalExpense: 50,
        netBalance: 75,
      });

      // Light check of date filter wiring (FindOperator 'between')
      const callArg = (txRepo.find as jest.Mock).mock.calls[0][0];
      expect(callArg.where.user.id).toBe('u-1');
      // TypeORM FindOperator has { type: 'between', value: [start, end] }
      expect(callArg.where.date?.type).toBe('between');
      expect(Array.isArray(callArg.where.date?.value)).toBe(true);
      const [start, end] = callArg.where.date.value;
      expect(start instanceof Date).toBe(true);
      expect(end instanceof Date).toBe(true);
    });
  });

  describe('getSummaryByCategory', () => {
    // Helper to build a chainable QueryBuilder mock that returns rows
    function qbReturning(rows: any[]): SelectQueryBuilder<Transaction> {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rows),
      };
      return qb as SelectQueryBuilder<Transaction>;
    }

    it('groups by type/category and returns a normalized summary object', async () => {
      const rows = [
        { type: ETransactionType.Income, category: 'Salary', total: '3000.00' },
        { type: ETransactionType.Expense, category: 'Food', total: '120.50' },
        { type: ETransactionType.Expense, category: 'Travel', total: '79.50' },
      ];
      (txRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        qbReturning(rows),
      );

      const out = await service.getSummaryByCategory(user, {
        month: '2024-05',
      } as any);

      expect(out).toEqual({
        Income: { Salary: 3000 },
        Expense: { Food: 120.5, Travel: 79.5 },
      });

      // Spot-check query wiring
      const qb = (txRepo.createQueryBuilder as jest.Mock).mock.results[0]
        .value as any;
      expect(qb.select).toHaveBeenCalledWith('tx.type', 'type');
      expect(qb.addSelect).toHaveBeenCalledWith('tx.category', 'category');
      expect(qb.where).toHaveBeenCalledWith('tx.userId = :userId', {
        userId: user.id,
      });
      // The final date filter uses named params `startDate`/`endDate`; ensure they exist
      const andWhereCalls = qb.andWhere.mock.calls;
      const dateCall = andWhereCalls.find(
        (c: any[]) =>
          typeof c[0] === 'string' &&
          c[0].includes('tx.date BETWEEN :startDate AND :endDate'),
      );
      expect(dateCall).toBeTruthy();
      expect(dateCall[1].startDate instanceof Date).toBe(true);
      expect(dateCall[1].endDate instanceof Date).toBe(true);
    });

    it('handles empty results', async () => {
      (txRepo.createQueryBuilder as jest.Mock).mockReturnValue(qbReturning([]));

      const out = await service.getSummaryByCategory(user, {
        month: '2024-01',
      } as any);

      expect(out).toEqual({ Income: {}, Expense: {} });
    });
  });
});
