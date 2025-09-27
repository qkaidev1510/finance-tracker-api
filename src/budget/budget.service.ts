import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBudgetRequestDto } from 'src/dtos/create-budget-request.dto';
import { Budget, Transaction } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createBudget(userId: string, dto: CreateBudgetRequestDto) {
    const budget = this.budgetRepository.create({
      user: { id: userId },
      category: dto.category,
      limitAmount: dto.limitAmount,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return this.budgetRepository.save(budget);
  }

  async getBudgets(userId: string) {
    return this.budgetRepository.find({ where: { user: { id: userId } } });
  }

  async getBudgetRemaining(userId: string) {
    const budgets = await this.budgetRepository.find({
      where: { user: { id: userId } },
    });

    const summaries = [];

    for (const budget of budgets) {
      const spent = await this.transactionRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where('tx.userId = :userId', { userId })
        .andWhere('tx.category = :category', { category: budget.category })
        .andWhere('tx.date BETWEEN :start AND :end', {
          start: budget.startDate,
          end: budget.endDate,
        })
        .getRawOne<{ total: string }>();

      const spentAmount = Number(spent.total) || 0;

      summaries.push({
        category: budget.category,
        limitAmount: Number(budget.limitAmount),
        spentAmount,
        remainingAmount: Number(budget.limitAmount) - spentAmount,
      });
    }

    //QUESTION: When should we use more sql or service logic for complex calculation?

    return summaries;
  }
}
