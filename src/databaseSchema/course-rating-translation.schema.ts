import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CourseRating } from './course-rating.schema';
import { Language } from './language.schema';

@Entity('course_rating_translations')
export class CourseRatingTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_rating_id', type: 'uuid' })
  course_rating_id!: string;

  @ManyToOne(() => CourseRating, (rating) => rating.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_rating_id' })
  course_rating!: CourseRating;

  @Column({ name: 'language_id', type: 'uuid' })
  language_id!: string;

  @ManyToOne(() => Language, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: Language;

  @Column({ type: 'text' })
  review!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
