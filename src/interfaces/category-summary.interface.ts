import { ETransactionType } from 'src/entities/transaction.entity';

export interface ICategorySummaryRaw {
  type: ETransactionType;
  category: string;
  total: string;
}
