import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Publication } from './Publication.entity';
import { User } from './User.entity';

@Entity('publication_moderation')
export class PublicationModeration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicationId: string;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicationId' })
  publication: Publication;

  @Column({ nullable: true })
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column('text')
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
