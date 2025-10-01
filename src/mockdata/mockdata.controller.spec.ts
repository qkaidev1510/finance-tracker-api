import { Test, TestingModule } from '@nestjs/testing';
import { MockdataController } from './mockdata.controller';
import { MockdataService } from './mockdata.service';
import { ApiKeyGuard } from './api-key.guard';

describe('MockdataController', () => {
  let controller: MockdataController;
  let service: {
    mockUsers: jest.Mock;
    mockTransactions: jest.Mock;
    mockBudgetData: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      mockUsers: jest.fn(),
      mockTransactions: jest.fn(),
      mockBudgetData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockdataController],
      providers: [{ provide: MockdataService, useValue: service }],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActive: () => true })
      .compile();

    controller = module.get(MockdataController);
  });

  describe('POST /mockdata', () => {
    it('calls mockUsers when table=user', async () => {
      service.mockUsers.mockResolvedValueOnce('users-done');

      const res = await controller.mockdata({ table: 'user', quantity: 2 });

      expect(service.mockUsers).toHaveBeenCalledTimes(1);
      expect(service.mockTransactions).not.toHaveBeenCalled();
      expect(service.mockBudgetData).not.toHaveBeenCalled();
      expect(res).toBe('users-done');
    });

    it('calls mockTransactions when table=transaction', async () => {
      service.mockTransactions.mockResolvedValueOnce('tx-done');

      const res = await controller.mockdata({
        table: 'transaction',
        quantity: 2,
      });

      expect(service.mockTransactions).toHaveBeenCalledTimes(1);
      expect(service.mockUsers).not.toHaveBeenCalled();
      expect(service.mockBudgetData).not.toHaveBeenCalled();
      expect(res).toBe('tx-done');
    });

    it('calls mockBudgetData when table=budget', async () => {
      service.mockBudgetData.mockResolvedValueOnce('budget-done');

      const res = await controller.mockdata({ table: 'budget', quantity: 2 });

      expect(service.mockBudgetData).toHaveBeenCalledTimes(1);
      expect(service.mockUsers).not.toHaveBeenCalled();
      expect(service.mockTransactions).not.toHaveBeenCalled();
      expect(res).toBe('budget-done');
    });

    it('returns undefined for unknown table', async () => {
      const res = await controller.mockdata({ table: 'unknown', quantity: 2 });

      expect(service.mockUsers).not.toHaveBeenCalled();
      expect(service.mockTransactions).not.toHaveBeenCalled();
      expect(service.mockBudgetData).not.toHaveBeenCalled();
      expect(res).toBeUndefined();
    });
  });
});
