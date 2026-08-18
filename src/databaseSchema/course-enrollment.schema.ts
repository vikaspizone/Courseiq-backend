import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.schema';
import { User } from './user.schema';
import { CoursePurchase } from './course-purchase.schema';
import { EnrollmentStatus } from '../utils/enums';

@Entity('course_enrollments')
export class CourseEnrollment {
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

  @Column({ name: 'purchase_id', type: 'uuid', nullable: true })
  purchase_id!: string | null;

  @ManyToOne(() => CoursePurchase, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchase_id' })
  purchase!: CoursePurchase | null;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status!: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrolled_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  started_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed_at!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
