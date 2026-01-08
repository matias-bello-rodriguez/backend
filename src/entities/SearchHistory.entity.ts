import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('historial_busqueda')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'termino_busqueda' })
  terminoBusqueda: string;

  @Column({ type: 'int', nullable: true, name: 'precio_min' })
  precioMin: number;

  @Column({ type: 'int', nullable: true, name: 'precio_max' })
  precioMax: number;

  @Column({ type: 'int', nullable: true, name: 'anio_min' })
  anioMin: number;

  @Column({ type: 'int', nullable: true, name: 'anio_max' })
  anioMax: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transmision: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  combustible: string;

  @CreateDateColumn({ name: 'fecha_busqueda' })
  fechaBusqueda: Date;

  @Column({ type: 'int', default: 0, name: 'resultados_encontrados' })
  resultadosEncontrados: number;
}
