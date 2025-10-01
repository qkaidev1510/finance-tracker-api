import { Test, TestingModule } from '@nestjs/testing';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SummaryQueryDto } from 'src/dtos';
import { User } from 'src/entities/user.entity';

describe('SummaryController', () => {
  let controller: SummaryController;
  let service: {
    getMonthlySummary: jest.Mock;
    getSummaryByCategory: jest.Mock;
  };

  const mockUser = { id: 'u-1', username: 'alice' } as unknown as User;

  beforeEach(async () => {
    service = {
      getMonthlySummary: jest.fn(),
      getSummaryByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [{ provide: SummaryService, useValue: service }],
    })
      // Bypass guard logic in unit tests
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SummaryController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /summary/monthly', () => {
    it('delegates to SummaryService.getMonthlySummary with user and query', async () => {
      const query: SummaryQueryDto = { month: '2024-05' } as any;
      const result = { totalIncome: 100, totalExpense: 30, netBalance: 70 };
      service.getMonthlySummary.mockResolvedValueOnce(result);

      const res = await controller.getMonthlySummary(mockUser, query);

      expect(service.getMonthlySummary).toHaveBeenCalledWith(mockUser, query);
      expect(res).toBe(result);
    });

    it('propagates errors from the service', async () => {
      const query: SummaryQueryDto = { month: '2024-05' } as any;
      service.getMonthlySummary.mockRejectedValueOnce(new Error('boom'));

      await expect(
        controller.getMonthlySummary(mockUser, query),
      ).rejects.toThrow('boom');
    });
  });

  describe('GET /summary/by-category', () => {
    it('delegates to SummaryService.getSummaryByCategory with user and query', async () => {
      const query: SummaryQueryDto = { month: '2024-06' } as any;
      const result = { Income: { Salary: 3000 }, Expense: { Food: 120.5 } };
      service.getSummaryByCategory.mockResolvedValueOnce(result);

      const res = await controller.getSummaryByCategory(mockUser, query);

      expect(service.getSummaryByCategory).toHaveBeenCalledWith(
        mockUser,
        query,
      );
      expect(res).toBe(result);
    });

    it('propagates errors from the service', async () => {
      const query: SummaryQueryDto = { month: '2024-06' } as any;
      service.getSummaryByCategory.mockRejectedValueOnce(new Error('err'));

      await expect(
        controller.getSummaryByCategory(mockUser, query),
      ).rejects.toThrow('err');
    });
  });
});
