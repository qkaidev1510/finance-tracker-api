import { Injectable } from '@nestjs/common';
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
  ) {}

  async create(dto: CreateTransactionRequestDto, userInfo: User) {
    const user = await this.userRepository.findOne({
      where: { id: userInfo.id },
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
    return this.transactionRepository.find({ where: { user: { id: userId } } });
  }

  async update(id: string, updateData: Partial<Transaction>) {
    await this.transactionRepository.update(id, updateData);
    return this.transactionRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.transactionRepository.delete(id);
  }
}
