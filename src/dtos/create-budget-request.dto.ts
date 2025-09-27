import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateBudgetRequestDto {
  @IsString()
  category: string;

  @IsNumber()
  limitAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
