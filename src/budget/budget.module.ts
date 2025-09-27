import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget, Transaction } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget])],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
