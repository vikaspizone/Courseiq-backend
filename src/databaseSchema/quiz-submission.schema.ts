import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.schema';
import { User } from './user.schema';

@Entity('quiz_submissions')
export class QuizSubmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  quizId!: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz!: Quiz;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ default: 0 })
  score!: number; // Percentage or points scored

  @Column({ default: false })
  passed!: boolean; // Did they pass the quiz

  @Column({ type: 'jsonb' })
  answers!: Record<string, string>; // Map of { questionId: selectedChoiceId }

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
