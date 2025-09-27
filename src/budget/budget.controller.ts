import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateBudgetRequestDto } from 'src/dtos/create-budget-request.dto';
import { User } from 'src/entities';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async createBudget(
    @CurrentUser() user: User,
    @Body() dto: CreateBudgetRequestDto,
  ) {
    return this.budgetService.createBudget(user.id, dto);
  }

  @Get()
  async getBudget(@CurrentUser() user: User) {
    return this.budgetService.getBudgets(user.id);
  }

  @Get('remaining')
  async getRemaining(@CurrentUser() user: User) {
    return this.budgetService.getBudgetRemaining(user.id);
  }
}
