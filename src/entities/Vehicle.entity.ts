import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Publication } from './Publication.entity';

@Entity('vehiculo')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  patente: string;

  // @Column({ length: 1, nullable: true })
  // dvPatente: string;

  @Column({ length: 50, nullable: true })
  marca: string;

  @Column({ length: 100, nullable: true })
  modelo: string;

  @Column({ type: 'int', nullable: true })
  anio: number;

  @Column({ length: 100, nullable: true })
  version: string;

  @Column({ type: 'int', nullable: true })
  kilometraje: number;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ length: 50, nullable: true })
  vin: string;

  @Column({ length: 50, nullable: true })
  numeroMotor: string;

  @Column({ length: 20, nullable: true })
  motor: string;

  @Column({ length: 30, nullable: true })
  combustible: string;

  @Column({ length: 30, nullable: true })
  transmision: string;

  @Column({ type: 'int', nullable: true })
  puertas: number;

  @Column({ length: 50, nullable: true })
  tipoVehiculo: string;

  @Column({ length: 20, nullable: true })
  mesRevisionTecnica: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ nullable: true })
  userId: string;

  @OneToMany(() => Publication, (publication) => publication.vehiculo)
  publications: Publication[];

  @ManyToOne(() => User, (user) => user.vehicles)
  @JoinColumn({ name: 'userId' })
  user: User;
}
