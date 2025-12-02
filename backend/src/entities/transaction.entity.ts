import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'transaction_type',
  })
  transactionType: 'debit' | 'credit';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NAD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'merchant_name' })
  merchantName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'merchant_category' })
  merchantCategory?: string;

  @Column({ type: 'integer', nullable: true, name: 'merchant_risk_level' })
  merchantRiskLevel?: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, name: 'location_latitude' })
  locationLatitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, name: 'location_longitude' })
  locationLongitude?: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'location_country' })
  locationCountry?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'location_city' })
  locationCity?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_fingerprint' })
  deviceFingerprint?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'failed' | 'blocked';

  @Column({ type: 'boolean', default: false, name: 'is_simulated' })
  isSimulated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;
}
