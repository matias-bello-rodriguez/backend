import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Publication } from './Publication.entity';
import { Vehicle } from './Vehicle.entity';
import { Inspection } from './Inspection.entity';

export enum SolicitudEstado {
  PENDIENTE = 'pendiente',
  ACEPTADA = 'aceptada',
  RECHAZADA = 'rechazada',
}

@Entity('solicitud_inspeccion')
export class SolicitudInspeccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mecanicoId: string;

  @Column({ nullable: true })
  publicacionId: string;

  @Column({ nullable: true })
  vehiculoId: string;

  @Column({ nullable: true })
  inspeccionId: string;

  @Column({
    type: 'enum',
    enum: SolicitudEstado,
    default: SolicitudEstado.PENDIENTE,
  })
  estado: SolicitudEstado;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaRespuesta: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaProgramada: Date;

  @Column({ length: 500, nullable: true })
  mensaje: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mecanicoId' })
  mecanico: User;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publication;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo: Vehicle;

  @ManyToOne(() => Inspection)
  @JoinColumn({ name: 'inspeccionId' })
  inspeccion: Inspection;
}
