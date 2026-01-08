import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './Payment.entity';

@Entity('pago_auditoria')
export class PaymentAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pagoId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'pagoId' })
  pago: Payment;

  @Column({ length: 50 })
  estadoAnterior: string;

  @Column({ length: 50 })
  estadoNuevo: string;

  @Column({ length: 255, nullable: true })
  mensaje: string;

  @CreateDateColumn()
  fechaCambio: Date;
}
