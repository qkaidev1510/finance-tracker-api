import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget, ETransactionType, Transaction, User } from 'src/entities';
import { Repository } from 'typeorm';

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

  async mockUsers() {
    try {
      const { faker } = await import('@faker-js/faker');
      const users = [];

      for (let i = 0; i < 50000; i++) {
        const user = this.userRepository.create({
          username: faker.internet.username(),
          pwdHash: faker.internet.password(),
        });

        users.push(user);
      }

      await this.userRepository.save(users);
      console.log('50000 Users Have Been Created!!!');
    } catch (error) {
      console.log(error);
    }
  }

  async mockTransactions() {
    const { faker } = await import('@faker-js/faker');
    const users = await this.userRepository.find({});

    const transactions = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < 2; j++) {
        const transaction = new Transaction();
        transaction.user = users[i];
        transaction.amount = parseFloat(faker.finance.amount());
        transaction.category = faker.commerce.department();
        transaction.type =
          Math.random() > 0.5
            ? ETransactionType.Income
            : ETransactionType.Expense;
        transaction.date = faker.date.recent();
        transaction.note = faker.lorem.sentence();
        transactions.push(transaction);
      }
    }

    await this.transactionRepository.save(transactions);
    console.log('100000 Transactions Have Been Created');
  }

  async mockBudgetData() {
    const { faker } = await import('@faker-js/faker');
    const users = await this.userRepository.find({});

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
      }
    }

    await this.budgetRepository.save(budgets);
  }
}
