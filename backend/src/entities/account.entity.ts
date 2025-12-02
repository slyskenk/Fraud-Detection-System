import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'account_number' })
  accountNumber: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'account_type',
  })
  accountType: 'checking' | 'savings' | 'credit';

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'NAD' })
  currency: string;

  @Column({ type: 'boolean', default: false, name: 'is_frozen' })
  isFrozen: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'frozen_at' })
  frozenAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'frozen_reason' })
  frozenReason?: string;

  @Column({ type: 'integer', default: 0, name: 'risk_score' })
  riskScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
