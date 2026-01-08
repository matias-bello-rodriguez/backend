import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Sede } from './Sede.entity';

@Entity('horario_sede')
export class SedeSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sedeId: number;

  @ManyToOne(() => Sede, (sede) => sede.schedules)
  @JoinColumn({ name: 'sedeId' })
  sede: Sede;

  @Column({ type: 'tinyint' })
  dia_semana: number; // 1=Lunes ... 7=Domingo

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;
}
