import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Transaction } from 'src/entities/transaction.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateTransactionRequestDto } from 'src/dtos';
import { ICurrentUser } from 'src/interfaces/current-user.interface';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: CreateTransactionRequestDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.transactionService.create(body, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: ICurrentUser) {
    return this.transactionService.findAll(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Transaction>) {
    return this.transactionService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
