import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Course } from './course.schema';
import { User } from './user.schema';
import { CourseRatingTranslation } from './course-rating-translation.schema';

@Entity('course_ratings')
@Unique(['user_id', 'course_id'])
export class CourseRating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating!: number;

  @OneToMany(() => CourseRatingTranslation, (translation) => translation.course_rating, { cascade: true })
  translations!: CourseRatingTranslation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
