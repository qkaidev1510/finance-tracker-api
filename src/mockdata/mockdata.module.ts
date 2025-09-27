import { Module } from '@nestjs/common';
import { MockdataController } from './mockdata.controller';
import { MockdataService } from './mockdata.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget, Transaction, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Budget])],
  controllers: [MockdataController],
  providers: [MockdataService],
})
export class MockdataModule {}
