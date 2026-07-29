import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.schema';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  quizId!: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz!: Quiz;

  @Column({ type: 'jsonb' })
  questionText!: Record<string, string>; // Multi-language question text

  @Column({ type: 'jsonb' })
  choices!: Record<string, any>[]; // Array of choices (localized). E.g. [{ id: "A", text: { en: "A", hi: "अ" } }]

  @Column()
  correctAnswer!: string; // The correct choice ID (e.g. "A")

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
