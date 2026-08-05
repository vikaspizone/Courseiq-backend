import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.schema';
import { User } from './user.schema';
import { DiscountType } from '../utils/enums';

@Entity('course_prices')
export class CoursePrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_price!: number | null;

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.FIXED, nullable: true })
  discount_type!: DiscountType | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_value!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  discount_start_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  discount_end_at!: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  created_by!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
