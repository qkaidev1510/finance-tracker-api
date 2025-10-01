import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget, ETransactionType, Transaction, User } from 'src/entities';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class MockdataService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  async mockUsers(quantity: number) {
    try {
      const users = [];
      const batchSize = 1000;

      for (let i = 0; i < quantity; i++) {
        const user = this.userRepository.create({
          username: faker.internet.userName(),
          pwdHash: faker.internet.password(),
        });

        users.push(user);

        if (users.length >= batchSize) {
          await this.userRepository.save(users);
          users.length = 0;
        }
      }

      await this.userRepository.save(users);

      console.log(`${quantity} Users Have Been Created!!!`);
    } catch (error) {
      console.log(error);
    }
  }

  async mockTransactions(quantity: number) {
    const users = await this.userRepository.find({});
    const batchSize = 1000;

    const transactions = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < quantity; j++) {
        const transaction = this.transactionRepository.create({
          user: users[i],
          amount: parseFloat(faker.finance.amount()),
          category: faker.commerce.department(),
          type:
            Math.random() > 0.5
              ? ETransactionType.Income
              : ETransactionType.Expense,
          date: faker.date.recent(),
          note: faker.lorem.sentence(),
        });

        transactions.push(transaction);

        if (transactions.length >= batchSize) {
          await this.transactionRepository.save(transactions);
          transactions.length = 0;
        }
      }
    }

    await this.transactionRepository.save(transactions);
    console.log(`${quantity} Transactions Have Been Created For Each User`);
  }

  async mockBudgetData() {
    const users = await this.userRepository.find({});
    const batchSize = 1000;

    if (users.length == 0) return;

    const categories = [
      'Food',
      'Entertainment',
      'Transportation',
      'Healthcare',
      'Shopping',
    ];
    const budgets = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < 2; j++) {
        const budget = new Budget();
        budget.user = users[i];
        budget.category = categories[j % categories.length];
        budget.limitAmount = parseFloat(
          faker.commerce.price({ min: 100, max: 1000 }),
        ); // Random budget between 100 and 1000
        budget.startDate = faker.date.past({ years: 1 }); // Start date within the last year
        budget.endDate = faker.date.future({ years: 1 }); // End date within the next year
        budgets.push(budget);

        if (budgets.length >= batchSize) {
          await this.budgetRepository.save(budgets);
          budgets.length = 0;
        }
      }
    }

    await this.budgetRepository.save(budgets);
  }
}
