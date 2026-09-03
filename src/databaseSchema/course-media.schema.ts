import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.schema';
import { Lesson } from './lesson.schema';
import { User } from './user.schema';
import { CourseMediaType } from '../utils/enums';

@Entity('course_media')
export class CourseMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lesson_id!: string | null;

  @ManyToOne(() => Lesson, (lesson) => lesson.media, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson | null;

  @Column({ type: 'enum', enum: CourseMediaType })
  type!: CourseMediaType;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  file_name!: string | null;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  file_path!: string | null;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  file_url!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mime_type!: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size!: string | null;

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration!: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;


  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'is_thumbnail', type: 'boolean', default: false })
  is_thumbnail!: boolean;

  @Column({ name: 'is_url', type: 'boolean', default: false })
  is_url!: boolean;

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
