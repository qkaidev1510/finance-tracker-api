import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionRequestDto } from 'src/dtos';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateTransactionRequestDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        pwdHash: false,
      },
    });

    const newTransaction = this.transactionRepository.create({
      amount: dto.amount,
      category: dto.category,
      type: dto.type,
      note: dto.note,
      user,
      date: new Date(),
    });

    return this.transactionRepository.save(newTransaction);
  }

  async findAll(userId: string) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      take: 10000,
    });
  }

  async findAllWithCache(userId: string) {
    const key = `transactions-${userId}`;

    const cachedValue = await this.cacheManager.get<Transaction[]>(key);

    if (cachedValue) {
      console.log('=== GET CACHE ===');
      console.log(`=== ${cachedValue.length} RECORDS ===`);
      return cachedValue;
    }

    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      take: 10000,
    });

    await this.cacheManager.set<Transaction[]>(
      key,
      transactions,
      1000 * 60 * 60, // 1 hour
    );

    console.log(`==== ${transactions.length} RECORDS ===`);

    return transactions;
  }

  async update(id: string, updateData: Partial<Transaction>) {
    await this.transactionRepository.update(id, updateData);
    return this.transactionRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.transactionRepository.delete(id);
  }
}
