import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MockdataService } from './mockdata.service';
import { ApiKeyGuard } from './api-key.guard';

@Controller('mockdata')
@UseGuards(ApiKeyGuard)
export class MockdataController {
  constructor(private readonly mockdataService: MockdataService) {}

  @Post()
  async mockdata(@Body() body: { table: string }) {
    if (body.table == 'user') return this.mockdataService.mockUsers();

    if (body.table == 'transaction')
      return this.mockdataService.mockTransactions();

    if (body.table == 'budget') return this.mockdataService.mockBudgetData();
  }
}
