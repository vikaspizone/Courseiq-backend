import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.schema';
import { Lesson } from './lesson.schema';

@Entity('lesson_progress')
@Unique(['userId', 'lessonId'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  lessonId!: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson!: Lesson;

  @Column({ default: 0 })
  watchedSeconds!: number; // Video progress in seconds

  @Column({ default: false })
  isCompleted!: boolean; // Has the student completed this lesson

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
