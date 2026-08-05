import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CourseCategory } from './course-category.schema';
import { CourseTranslation } from './course-translation.schema';
import { CoursePrice } from './course-price.schema';
import { User } from './user.schema';
import { CourseType, CourseLevel, CourseStatus } from '../utils/enums';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  category_id!: string;

  @ManyToOne(() => CourseCategory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: CourseCategory;

  @Column({ type: 'enum', enum: CourseType, default: CourseType.FREE })
  type!: CourseType;

  @Column({ type: 'enum', enum: CourseLevel, default: CourseLevel.BEGINNER })
  level!: CourseLevel;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  @Column({ type: 'varchar', nullable: true })
  language!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  topics!: any;

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT })
  status!: CourseStatus;

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

  @OneToMany(() => CourseTranslation, (translation) => translation.course, { cascade: true })
  translations!: CourseTranslation[];

  @OneToMany(() => CoursePrice, (price) => price.course, { cascade: true })
  prices!: CoursePrice[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at!: Date;
}
