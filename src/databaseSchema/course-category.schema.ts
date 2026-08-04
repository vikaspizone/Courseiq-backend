import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CourseCategoryTranslation } from './course-category-translation.schema';
import { User } from './user.schema';

@Entity('course_categories')
export class CourseCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parent_id!: string | null;

  @ManyToOne(() => CourseCategory, (category) => category.children, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: CourseCategory | null;

  @OneToMany(() => CourseCategory, (category) => category.parent)
  children!: CourseCategory[];

  @Column({ default: 'active' })
  status!: string;

  @Column({ name: 'created_by', type: 'uuid' })
  created_by!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => CourseCategoryTranslation, (translation) => translation.category, { cascade: true })
  translations!: CourseCategoryTranslation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
