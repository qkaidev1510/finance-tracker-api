import { IsString, Matches } from 'class-validator';

export class SummaryQueryDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in the format YYYY-MM (e.g., 2025-09)',
  })
  month: string;
}
