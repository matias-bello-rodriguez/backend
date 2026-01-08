import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inspection } from './Inspection.entity';
import { Question } from './Question.entity';
import { AnswerOption } from './AnswerOption.entity';

@Entity('respuesta_inspeccion')
export class InspectionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  inspeccionId: string;

  @ManyToOne(() => Inspection)
  @JoinColumn({ name: 'inspeccionId' })
  inspeccion: Inspection;

  @Column({ nullable: true })
  preguntaId: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'preguntaId' })
  pregunta: Question;

  @Column({ nullable: true })
  respuestaOpcionId: number;

  @ManyToOne(() => AnswerOption)
  @JoinColumn({ name: 'respuestaOpcionId' })
  respuestaOpcion: AnswerOption;

  @Column({ length: 255, nullable: true })
  respuestaTextoManual: string;

  @Column({ length: 255, nullable: true })
  imagen_url: string;
}
