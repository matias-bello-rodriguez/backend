import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Publication } from './Publication.entity';

@Entity('publicacion_usuario_like')
export class PublicationLike {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  usuarioId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  publicacionId: string;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publication;

  @CreateDateColumn()
  fechaCreacion: Date;
}
