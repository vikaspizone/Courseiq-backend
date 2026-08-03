import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PermissionTranslation } from './permission-translation.schema';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => PermissionTranslation, (translation) => translation.permission, { cascade: true })
  translations!: PermissionTranslation[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
