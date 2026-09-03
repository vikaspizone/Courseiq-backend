import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.schema';
import { CourseSection } from './course-section.schema';
import { User } from './user.schema';
import { LessonTranslation } from './lesson-translation.schema';
import { CourseMedia } from './course-media.schema';
import { LessonType } from '../utils/enums';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'section_id', type: 'uuid' })
  section_id!: string;

  @ManyToOne(() => CourseSection, (section) => section.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: CourseSection;

  @Column({ type: 'enum', enum: LessonType, default: LessonType.VIDEO })
  type!: LessonType;

  @Column({ name: 'duration', type: 'int', default: 0 })
  duration!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'is_preview', type: 'boolean', default: false })
  is_preview!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
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

  @OneToMany(() => LessonTranslation, (translation) => translation.lesson, { cascade: true })
  translations!: LessonTranslation[];

  @OneToMany(() => CourseMedia, (media) => media.lesson, { cascade: true })
  media!: CourseMedia[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
