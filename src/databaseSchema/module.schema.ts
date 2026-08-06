import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ModuleTranslation } from './module-translation.schema';

@Entity('modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  route!: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sort_order!: number;

  @OneToMany(() => ModuleTranslation, (translation) => translation.module, { cascade: true })
  translations!: ModuleTranslation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
