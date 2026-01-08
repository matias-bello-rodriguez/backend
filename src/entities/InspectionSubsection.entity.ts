import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InspectionSection } from './InspectionSection.entity';
import { Question } from './Question.entity';

@Entity('subseccion_inspeccion')
export class InspectionSubsection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ nullable: true })
  seccionId: number;

  @ManyToOne(() => InspectionSection, (section) => section.subsections)
  @JoinColumn({ name: 'seccionId' })
  seccion: InspectionSection;

  @Column({ type: 'int', nullable: true })
  posicion: number;

  @OneToMany(() => Question, (question) => question.subseccion)
  questions: Question[];
}
