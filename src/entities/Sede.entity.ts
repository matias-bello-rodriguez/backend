import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SedeSchedule } from './SedeSchedule.entity';

@Entity('sede')
export class Sede {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => SedeSchedule, (schedule) => schedule.sede)
  schedules: SedeSchedule[];
}
