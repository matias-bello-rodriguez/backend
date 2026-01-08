import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('horario_mecanico')
export class MechanicSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mechanicId: string;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'mechanicId' })
  mechanic: User;

  @Column()
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.

  @Column('simple-json')
  timeSlots: string[]; // ["09:00", "10:00", ...]

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
