import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.schema';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender?: string;

  @Column({ name: 'profile_image', type: 'varchar', length: 500, nullable: true })
  profile_image?: string;

  @Column()
  password!: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  qualification?: any;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  experience?: number;

  @Column({ type: 'jsonb', nullable: true })
  languages?: any;

  @Column({ type: 'jsonb', nullable: true })
  address?: any;

  @Column({ type: 'jsonb', nullable: true })
  work?: any;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @ManyToOne(() => Role, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'role_id', type: 'uuid' })
  role_id!: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
