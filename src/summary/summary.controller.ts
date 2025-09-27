import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SummaryQueryDto } from 'src/dtos';
import { User } from 'src/entities/user.entity';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @UseGuards(JwtAuthGuard)
  @Get('monthly')
  getMonthlySummary(
    @CurrentUser() user: User,
    @Query() query: SummaryQueryDto,
  ) {
    return this.summaryService.getMonthlySummary(user, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-category')
  getSummaryByCategory(
    @CurrentUser() user: User,
    @Query() query: SummaryQueryDto,
  ) {
    return this.summaryService.getSummaryByCategory(user, query);
  }
}
