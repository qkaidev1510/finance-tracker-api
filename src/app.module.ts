import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionModule } from './transaction/transaction.module';
import { SummaryModule } from './summary/summary.module';
import { BudgetModule } from './budget/budget.module';
import { MockdataModule } from './mockdata/mockdata.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
            synchronize: false,
            ssl: { rejectUnauthorized: false },
          };
        } else {
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'admin123',
            password: 'admin123',
            database: 'finance_db',
            autoLoadEntities: true,
            synchronize: false,
          };
        }
      },
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
