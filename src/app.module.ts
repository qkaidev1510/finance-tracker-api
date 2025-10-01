import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionModule } from './transaction/transaction.module';
import { SummaryModule } from './summary/summary.module';
import { BudgetModule } from './budget/budget.module';
import { MockdataModule } from './mockdata/mockdata.module';
import { LoggerModule } from './logger/logger.module';
import { RequestContextMiddleware } from './middlewares/request-context.middleware';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [__dirname + '/**/*.entity.{js,ts}'],
          synchronize: false,
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
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
