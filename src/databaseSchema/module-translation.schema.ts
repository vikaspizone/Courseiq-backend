import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleEntity } from './module.schema';
import { Language } from './language.schema';

@Entity('module_translations')
export class ModuleTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId!: string;

  @ManyToOne(() => ModuleEntity, (mod) => mod.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: ModuleEntity;

  @Column({ name: 'language_id', type: 'uuid' })
  languageId!: string;

  @ManyToOne(() => Language, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: Language;

  @Column({ unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
