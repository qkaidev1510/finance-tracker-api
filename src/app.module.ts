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

        return {
          type: 'postgres',
          url: dbUrl,
          // autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity.{js,ts}'],
          synchronize: true,
          ssl:
            process.env.NODE_ENV == 'production'
              ? { rejectUnauthorized: false }
              : false,
        };
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
