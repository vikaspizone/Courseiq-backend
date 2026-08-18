import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.schema';
import { User } from './user.schema';
import { CoursePrice } from './course-price.schema';
import { PaymentStatus, PaymentMethod } from '../utils/enums';

@Entity('course_purchases')
export class CoursePurchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id!: string;

  @ManyToOne(() => Course, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  final_price!: number;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status!: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.OTHER })
  payment_method!: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_gateway!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  coupon_code!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchased_at!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
