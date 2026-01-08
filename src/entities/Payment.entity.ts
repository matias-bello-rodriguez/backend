import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

export enum PaymentStatus {
  PENDING = 'Pendiente',
  COMPLETED = 'Completado',
  FAILED = 'Fallido',
  REFUNDED = 'Reembolsado',
}

export enum PaymentMethod {
  WEBPAY = 'WebPay',
  TRANSFER = 'Transferencia',
  CASH = 'Efectivo',
  SALDO_AUTOBOX = 'Saldo AutoBox',
}

@Entity('pago')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  usuarioId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column('int')
  monto: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  estado: PaymentStatus;

  @Column({
    name: 'metodoPago',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.WEBPAY,
  })
  metodo: PaymentMethod;

  @Column({ name: 'referenciaExterna', length: 255, nullable: true })
  detalles: string;

  @Column({ length: 100, nullable: true })
  idempotencyKey: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
