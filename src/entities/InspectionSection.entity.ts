import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InspectionSubsection } from './InspectionSubsection.entity';

@Entity('seccion_inspeccion')
export class InspectionSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'int', nullable: true })
  posicion: number;

  @OneToMany(() => InspectionSubsection, (subsection) => subsection.seccion)
  subsections: InspectionSubsection[];
}
