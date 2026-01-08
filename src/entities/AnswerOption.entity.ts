import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './Question.entity';

@Entity('respuesta')
export class AnswerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  preguntaId: number;

  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'preguntaId' })
  pregunta: Question;

  @Column({ length: 255 })
  respuestaTexto: string;

  @Column({ type: 'int' })
  calificacion: number;
}
