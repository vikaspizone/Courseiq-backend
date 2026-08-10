import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PermissionEntity } from './permission.schema';

@Entity('route_permission_maps')
export class RoutePermissionMapEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string; // GET, POST, PUT, DELETE, etc.

  @Column({ type: 'varchar', length: 255 })
  route!: string; // e.g. /roles, /roles/:id

  @Column({ name: 'permission_id', type: 'uuid', nullable: true })
  permission_id?: string;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
