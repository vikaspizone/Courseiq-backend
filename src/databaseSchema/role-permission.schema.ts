import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.schema';
import { ModuleEntity } from './module.schema';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  role_id!: string;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId!: string;

  @Column({ name: 'permission_ids', type: 'jsonb', default: [] })
  permissionIds!: string[];

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => ModuleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: ModuleEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
