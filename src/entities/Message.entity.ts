import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Vehicle } from './Vehicle.entity';

@Entity('mensaje')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  remitenteId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'remitenteId' })
  remitente: User;

  @Column({ type: 'varchar', length: 36 })
  destinatarioId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'destinatarioId' })
  destinatario: User;

  @Column({ name: 'contenido', type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  vehiculoId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo: Vehicle;

  @Column({ default: false })
  leido: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;
}
