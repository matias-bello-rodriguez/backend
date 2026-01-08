import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('system_setting')
export class SystemSetting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;
}
