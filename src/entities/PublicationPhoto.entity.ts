import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Publication } from './Publication.entity';

@Entity('publicacion_fotos')
export class PublicationPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  publicacionId: string;

  @ManyToOne(() => Publication, (publication) => publication.fotos)
  @JoinColumn({ name: 'publicacionId' })
  publicacion: Publication;

  @Column({ length: 255 })
  url: string;
}
