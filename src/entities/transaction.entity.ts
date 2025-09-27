import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum ETransactionType {
  Income = 'Income',
  Expense = 'Expense',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  amount: number;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: ETransactionType })
  type: ETransactionType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  note?: string;
}
