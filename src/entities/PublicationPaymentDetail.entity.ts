import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Publication } from './Publication.entity';
import { Payment } from './Payment.entity';

@Entity('detalle_publicacion_pago')
export class PublicationPaymentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  publicacionId: string;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publication;

  @Column({ nullable: true })
  pagoId: string;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'pagoId' })
  pago: Payment;

  @Column('int')
  monto: number;
}
