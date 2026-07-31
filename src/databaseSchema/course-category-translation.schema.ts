import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CourseCategory } from './course-category.schema';
import { Language } from './language.schema';

@Entity('course_category_translations')
export class CourseCategoryTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_category_id', type: 'uuid' })
  courseCategoryId!: string;

  @ManyToOne(() => CourseCategory, (category) => category.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_category_id' })
  category!: CourseCategory;

  @Column({ name: 'language_id', type: 'uuid' })
  languageId!: string;

  @ManyToOne(() => Language, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: Language;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
