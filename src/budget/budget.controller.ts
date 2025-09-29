import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateBudgetRequestDto } from 'src/dtos/create-budget-request.dto';
import { ICurrentUser } from 'src/interfaces/current-user.interface';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async createBudget(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: CreateBudgetRequestDto,
  ) {
    return this.budgetService.createBudget(user.userId, dto);
  }

  @Get()
  async getBudget(@CurrentUser() user: ICurrentUser) {
    return this.budgetService.getBudgets(user.userId);
  }

  @Get('remaining')
  async getRemaining(@CurrentUser() user: ICurrentUser) {
    return this.budgetService.getBudgetRemaining(user.userId);
  }
}
