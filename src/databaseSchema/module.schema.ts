import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ModuleTranslation } from './module-translation.schema';

@Entity('modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => ModuleTranslation, (translation) => translation.module, { cascade: true })
  translations!: ModuleTranslation[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
