import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './course.schema';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'jsonb' })
  title!: Record<string, string>; // Multi-language title, e.g. { en: "Math Quiz", hi: "गणित प्रश्नोत्तरी" }

  @Column({ default: 0 })
  durationMinutes!: number; // Active countdown timer duration

  @Column({ default: 50 })
  passingScore!: number; // Passing criteria score percentage (e.g. 50%)

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
