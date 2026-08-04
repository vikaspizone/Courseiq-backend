import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PermissionEntity } from './permission.schema';
import { Language } from './language.schema';

@Entity('permission_translations')
export class PermissionTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'permission_id', type: 'uuid' })
  permission_id!: string;

  @ManyToOne(() => PermissionEntity, (perm) => perm.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;

  @Column({ name: 'language_id', type: 'uuid' })
  language_id!: string;

  @ManyToOne(() => Language, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: Language;

  @Column({ unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
