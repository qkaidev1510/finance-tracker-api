import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { TransactionModule } from './transaction/transaction.module';
import { SummaryModule } from './summary/summary.module';
import { BudgetModule } from './budget/budget.module';
import { MockdataModule } from './mockdata/mockdata.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'finance_db',
      entities: [User, Transaction],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TransactionModule,
    SummaryModule,
    BudgetModule,
    MockdataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
