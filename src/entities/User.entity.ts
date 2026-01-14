import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from './Vehicle.entity';
import { Publication } from './Publication.entity';
import { Inspection } from './Inspection.entity';
import { Payment } from './Payment.entity';
import { UserSchedule } from './UserSchedule.entity';

export enum UserRole {
  USUARIO = 'Usuario',
  MECANICO = 'Mecánico',
  ADMINISTRADOR = 'Administrador',
}

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, nullable: true })
  rut: string;

  @Column({ length: 50, nullable: true })
  primerNombre: string;

  @Column({ length: 255, nullable: true })
  reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires: Date;

  @Column({ length: 50, nullable: true })
  segundoNombre: string;

  @Column({ length: 50, nullable: true })
  primerApellido: string;

  @Column({ length: 50, nullable: true })
  segundoApellido: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USUARIO })
  rol: UserRole;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ type: 'int', default: 0 })
  saldo: number;

  @Column({ length: 255, nullable: true })
  foto_url: string;

  @Column({ length: 255, nullable: true })
  pushToken: string;

  @Column({ length: 255, select: false })
  password?: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => Publication, (publication) => publication.vendedor)
  publications: Publication[];

  @OneToMany(() => Inspection, (inspection) => inspection.solicitante)
  inspectionsRequested: Inspection[];

  @OneToMany(() => Inspection, (inspection) => inspection.mecanico)
  inspectionsAssigned: Inspection[];

  @OneToMany(() => Payment, (payment) => payment.usuario)
  payments: Payment[];

  @OneToMany(() => UserSchedule, (schedule) => schedule.user)
  schedules: UserSchedule[];
}
