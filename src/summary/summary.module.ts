import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
