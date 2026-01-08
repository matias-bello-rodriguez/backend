import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

export enum TransactionType {
  CARGA = 'CARGA',
  PAGO_SERVICIO = 'PAGO_SERVICIO',
  COMISION = 'COMISION',
  RETIRO = 'RETIRO',
  REEMBOLSO = 'REEMBOLSO',
}

@Entity('transaccion_billetera')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ type: 'int' })
  monto: number;

  @Column({ type: 'enum', enum: TransactionType })
  tipo: TransactionType;

  @Column({ nullable: true })
  referenciaId: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'int' })
  saldoDespues: number;

  @CreateDateColumn()
  fechaCreacion: Date;
}
