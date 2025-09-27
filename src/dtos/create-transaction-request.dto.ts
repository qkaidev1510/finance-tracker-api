import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ETransactionType } from 'src/entities/transaction.entity';

export class CreateTransactionRequestDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ enum: ETransactionType })
  @IsEnum(ETransactionType)
  type: ETransactionType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note?: string;
}
