import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inspection } from './Inspection.entity';
import { Payment } from './Payment.entity';

@Entity('detalle_inspeccion_pago')
export class InspectionPaymentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  inspeccionId: string;

  @ManyToOne(() => Inspection)
  @JoinColumn({ name: 'inspeccionId' })
  inspeccion: Inspection;

  @Column({ nullable: true })
  pagoId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'pagoId' })
  pago: Payment;

  @Column('int')
  monto: number;
}
