import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SummaryQueryDto } from 'src/dtos';
import { ETransactionType, Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { ICategorySummaryRaw } from 'src/interfaces/category-summary.interface';
import { Between, Repository } from 'typeorm';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getMonthlySummary(user: User, query: SummaryQueryDto) {
    const [year, month] = query.month.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

    const transactions = await this.transactionRepository.find({
      where: { user: { id: user.id }, date: Between(startDate, endDate) },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((txn) => {
      if (txn.type === ETransactionType.Income) totalIncome += txn.amount;
      else totalExpense += txn.amount;
    });

    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
    };
  }

  async getSummaryByCategory(user: User, query: SummaryQueryDto) {
    const [year, month] = query.month.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

    const result = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('tx.type', 'type')
      .addSelect('tx.category', 'category')
      .addSelect('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId', { userId: user.id })
      .andWhere('tx.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('tx.type')
      .addGroupBy('tx.category')
      .getRawMany<ICategorySummaryRaw>();

    const summary: Record<ETransactionType, Record<string, number>> = {
      Income: {},
      Expense: {},
    };

    result.forEach((row) => {
      summary[row.type][row.category] = Number(row.total);
    });

    return summary;
  }
}
