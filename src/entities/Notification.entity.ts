import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

export enum NotificationType {
  CREAR_PUB = 'crear_pub',
  CREAR_INSP = 'crear_insp',
  CREAR_PUB_INSP = 'crear_pub_insp',
  AGENDAR_ADMIN = 'agendar_admin',
  AGENDAR_DUENO = 'agendar_dueno',
  AGENDAR_VEND = 'agendar_vend',
  SOLICITAR_MEC = 'solicitar_mec',
  RECHAZO_MEC = 'rechazo_mec',
  ACEPTAR_MEC_ADMIN = 'aceptar_mec_admin',
  ACEPTAR_MEC_VEND = 'aceptar_mec_vend',
  ACEPTAR_MEC_DUENO = 'aceptar_mec_dueno',
  FINALIZADO_VEND = 'finalizado_vend',
  FINALIZADO_DUENO = 'finalizado_dueno',
  FINALIZADO_MEC = 'finalizado_mec',
  FINALIZADO_ADMIN = 'finalizado_admin',
  CANCELADO_ADMIN = 'cancelado_admin',
  CANCELADO_MEC = 'cancelado_mec',
  CANCELADO_VEND = 'cancelado_vend',
  CANCELADO_DUENO = 'cancelado_dueno',
  REAGENDAR_VEND = 'reagendar_vend',
  REAGENDAR_DUENO = 'reagendar_dueno',
  NOT_DESACTIVAR_PUB_ADMIN = 'not_desactivar_pub_admin',
  NOT_DESACTIVAR_PUB_VEND = 'not_desactivar_pub_vend',
  PAGO_RECIBIDO_MEC = 'pago_recibido_mec',
}

@Entity('notificacion')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.CREAR_PUB,
  })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ nullable: true })
  relatedId: string;

  @CreateDateColumn()
  createdAt: Date;
}
