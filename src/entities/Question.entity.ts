import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InspectionSubsection } from './InspectionSubsection.entity';
import { AnswerOption } from './AnswerOption.entity';

@Entity('pregunta')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  pregunta: string;

  @Column({ nullable: true })
  subseccionId: number;

  @ManyToOne(() => InspectionSubsection, (subsection) => subsection.questions)
  @JoinColumn({ name: 'subseccionId' })
  subseccion: InspectionSubsection;

  @Column({ type: 'int', nullable: true })
  posicion: number;

  @Column({ type: 'int', nullable: true })
  escala: number;

  @OneToMany(() => AnswerOption, (answer) => answer.pregunta)
  answers: AnswerOption[];
}
