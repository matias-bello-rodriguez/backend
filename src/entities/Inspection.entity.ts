import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Publication } from './Publication.entity';
import { SedeSchedule } from './SedeSchedule.entity';
import { InspectionPaymentDetail } from './InspectionPaymentDetail.entity';
import { InspectionAnswer } from './InspectionAnswer.entity';

export enum InspectionStatus {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  EN_SUCURSAL = 'En_sucursal',
  FINALIZADA = 'Finalizada',
  RECHAZADA = 'Rechazada',
  POSTERGADA = 'Postergada',
}

export enum PaymentStatus {
  CONFIRMADO = 'Confirmado',
  INCOMPLETO = 'Incompleto',
  CANCELADO = 'Cancelado',
}

@Entity('inspeccion')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitanteId', nullable: true })
  solicitanteId: string;

  @ManyToOne(() => User, (user) => user.inspectionsRequested)
  @JoinColumn({ name: 'solicitanteId' })
  solicitante: User;

  @Column({ nullable: true })
  publicacionId: string;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publication;

  @Column({ default: false })
  pagada: boolean;

  @Column({ nullable: true })
  horarioId: number;

  @ManyToOne(() => SedeSchedule)
  @JoinColumn({ name: 'horarioId' })
  horario: SedeSchedule;

  @Column({ nullable: true })
  mecanicoId: string;

  @ManyToOne(() => User, (user) => user.inspectionsAssigned)
  @JoinColumn({ name: 'mecanicoId' })
  mecanico: User;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.PENDIENTE,
  })
  estado_insp: InspectionStatus;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
  estado_pago: PaymentStatus;

  @Column({ type: 'datetime', nullable: true })
  fechaProgramada: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaCompletada: Date;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 255, nullable: true })
  observacion: string;

  @Column({ length: 50, nullable: true })
  cancellationReason: string;

  @Column({ type: 'int', nullable: true })
  valor: number;

  @Column({ type: 'tinyint', nullable: true })
  rating: number;

  @Column({ type: 'json', nullable: true })
  answers: any;

  @Column({ type: 'json', nullable: true })
  comments: any;
  @OneToMany(() => InspectionAnswer, (answer) => answer.inspeccion)
  inspectionAnswers: InspectionAnswer[];

  @OneToMany(() => InspectionPaymentDetail, (detail) => detail.inspeccion)
  paymentDetails: InspectionPaymentDetail[];
}
