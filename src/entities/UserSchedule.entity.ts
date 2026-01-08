import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('usuario_horario')
export class UserSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuarioId: string;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'usuarioId' })
  user: User;

  @Column({ type: 'tinyint' })
  dia_semana: number; // 1=Lunes ... 7=Domingo

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ default: true })
  activo: boolean;
}
