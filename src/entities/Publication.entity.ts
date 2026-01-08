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
import { Vehicle } from './Vehicle.entity';
import { User } from './User.entity';
import { PublicationPhoto } from './PublicationPhoto.entity';
import { PublicationPaymentDetail } from './PublicationPaymentDetail.entity';

export enum PublicationStatus {
  PENDIENTE = 'Pendiente',
  PUBLICADA = 'Publicada',
  DESACTIVADA = 'Desactivada',
  BLOQUEADA = 'Bloqueada',
}

@Entity('publicacion')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  vehiculoId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo: Vehicle;

  @Column({ nullable: true })
  vendedorId: string;

  @ManyToOne(() => User, (user) => user.publications)
  @JoinColumn({ name: 'vendedorId' })
  vendedor: User;

  @Column({
    type: 'enum',
    enum: PublicationStatus,
    default: PublicationStatus.PENDIENTE,
  })
  estado: PublicationStatus;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  @Column({ type: 'int', nullable: true })
  valor: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => PublicationPhoto, (photo) => photo.publicacion)
  fotos: PublicationPhoto[];

  @OneToMany(() => PublicationPaymentDetail, (detail) => detail.publicacion)
  paymentDetails: PublicationPaymentDetail[];
}
