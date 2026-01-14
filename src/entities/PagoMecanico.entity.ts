import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('pago_mecanico')
export class PagoMecanico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mecanico_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mecanico_id' })
  mecanico: User;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column()
  fecha_pago: Date;

  @Column()
  comprobante_url: string;

  @Column({ type: 'text', nullable: true })
  nota: string;

  @CreateDateColumn()
  created_at: Date;
}
