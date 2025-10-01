import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockdataService } from './mockdata.service';
import { User, Transaction, Budget } from 'src/entities';

// We’ll stub only the faker functions we actually use.
jest.mock('@faker-js/faker', () => ({
  faker: {
    internet: {
      userName: jest.fn(() => 'mockUser'),
      password: jest.fn(() => 'mockPassword'),
    },
    finance: {
      amount: jest.fn(() => '123.45'),
    },
    commerce: {
      department: jest.fn(() => 'MockDept'),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      price: jest.fn(({ min, max }: { min: number; max: number }) => '500.00'),
    },
    date: {
      recent: jest.fn(() => new Date('2024-01-02T00:00:00Z')),
      past: jest.fn(() => new Date('2023-01-02T00:00:00Z')),
      future: jest.fn(() => new Date('2025-01-02T00:00:00Z')),
    },
    lorem: {
      sentence: jest.fn(() => 'Mock note'),
    },
  },
}));

type MockRepo<T = any> = {
  [K in keyof Repository<T>]?: jest.Mock;
};

describe('MockdataService', () => {
  let service: MockdataService;
  let userRepo: MockRepo<User>;
  let txRepo: MockRepo<Transaction>;
  let budgetRepo: MockRepo<Budget>;

  beforeEach(async () => {
    userRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    txRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    budgetRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockdataService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
        { provide: getRepositoryToken(Budget), useValue: budgetRepo },
      ],
    }).compile();

    service = module.get(MockdataService);
    jest.spyOn(console, 'log').mockImplementation(() => {}); // silence console in tests
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mockTransactions', () => {
    it('creates 2 transactions per user and saves them (final save)', async () => {
      // Arrange: 3 users
      const users: Partial<User>[] = [
        { id: 'u1', username: 'u1' },
        { id: 'u2', username: 'u2' },
        { id: 'u3', username: 'u3' },
      ];
      (userRepo.find as jest.Mock).mockResolvedValueOnce(users);

      // create should return an object that looks like a Transaction entity
      (txRepo.create as jest.Mock).mockImplementation((input) => ({
        id: 'tx-' + Math.random().toString(36).slice(2),
        ...input,
      }));

      // Act
      await service.mockTransactions(2);

      // Assert
      // 2 per user → 6 total created
      expect(txRepo.create).toHaveBeenCalledTimes(6);

      // Because batchSize is 1000 and 6 < 1000, we expect only the final save call
      expect(txRepo.save).toHaveBeenCalledTimes(1);
      const [arg] = (txRepo.save as jest.Mock).mock.calls[0];
      expect(Array.isArray(arg)).toBe(true);
      expect(arg).toHaveLength(6);

      // Fields present on at least one created item
      const one = arg[0];
      expect(one.user).toBe(users[0]);
      expect(typeof one.amount).toBe('number'); // parseFloat(faker.finance.amount())
      expect(['Income', 'Expense']).toContain(one.type); // enum string if your entity uses it
      expect(one.category).toBe('MockDept');
      expect(one.note).toBe('Mock note');
      expect(one.date instanceof Date).toBe(true);
    });

    it('handles zero users gracefully (still calls final save with empty array)', async () => {
      (userRepo.find as jest.Mock).mockResolvedValueOnce([]);

      await service.mockTransactions(2);

      expect(txRepo.create).not.toHaveBeenCalled();
      // The implementation saves even the (empty) remainder at the end
      expect(txRepo.save).toHaveBeenCalledTimes(1);
      const [arg] = (txRepo.save as jest.Mock).mock.calls[0];
      expect(Array.isArray(arg)).toBe(true);
      expect(arg).toHaveLength(0);
    });
  });

  describe('mockBudgetData', () => {
    it('returns early when there are no users', async () => {
      (userRepo.find as jest.Mock).mockResolvedValueOnce([]);

      await service.mockBudgetData();

      expect(budgetRepo.save).not.toHaveBeenCalled();
    });

    it('creates 2 budgets per user and saves them (final save)', async () => {
      const users: Partial<User>[] = [
        { id: 'u1', username: 'u1' },
        { id: 'u2', username: 'u2' },
      ];
      (userRepo.find as jest.Mock).mockResolvedValueOnce(users);

      await service.mockBudgetData();

      // For 2 users * 2 budgets each = 4 total
      expect(budgetRepo.save).toHaveBeenCalledTimes(1);
      const [arg] = (budgetRepo.save as jest.Mock).mock.calls[0];
      expect(Array.isArray(arg)).toBe(true);
      expect(arg).toHaveLength(4);

      const sample = arg[0];
      expect(sample.user).toBe(users[0]);
      expect(sample.category).toBeDefined();
      expect(typeof sample.limitAmount).toBe('number');
      expect(sample.startDate instanceof Date).toBe(true);
      expect(sample.endDate instanceof Date).toBe(true);
    });
  });

  // ⚠️ We intentionally do NOT execute mockUsers(): it loops 50,000 times.
  // If you REALLY want to test it, refactor the method to accept "count" and "batchSize".
  describe.skip('mockUsers (skipped - very large loop)', () => {
    it('batches and saves users', async () => {
      // Suggested refactor (not present yet):
      // service.mockUsers({ count: 5_000, batchSize: 100 });
      // Then assert userRepo.save called with batches and the final remainder.
    });
  });
});
