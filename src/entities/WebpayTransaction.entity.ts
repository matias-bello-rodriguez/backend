import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './Payment.entity';

@Entity('webpay_plus_transaccion')
export class WebpayTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pagoId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'pagoId' })
  pago: Payment;

  @Column({ length: 255 })
  token: string;

  @Column({ length: 50 })
  status: string;

  @Column('int')
  amount: number;

  @Column({ length: 255, nullable: true })
  buyOrder: string;

  @Column({ length: 255, nullable: true })
  sessionId: string;

  @Column('text', { nullable: true })
  rawResponse: string;

  @Column({ length: 255, nullable: true })
  cardNumber: string;

  @Column({ length: 255, nullable: true })
  accountingDate: string;

  @Column({ length: 255, nullable: true })
  transactionDate: string;

  @Column({ length: 255, nullable: true })
  authorizationCode: string;

  @Column({ length: 255, nullable: true })
  paymentTypeCode: string;

  @Column('int', { nullable: true })
  responseCode: number;

  @Column('int', { nullable: true })
  installmentsAmount: number;

  @Column('int', { nullable: true })
  installmentsNumber: number;

  @Column('int', { nullable: true })
  balance: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
