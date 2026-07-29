import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.schema';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'jsonb' })
  title!: Record<string, string>; // Multi-language title, e.g. { en: "HLS Player", hi: "HLS प्लेयर" }

  @Column({ type: 'jsonb', nullable: true })
  description?: Record<string, string>; // Multi-language description

  @Column({ nullable: true })
  videoUrl?: string; // HLS (.m3u8) Playback URL

  @Column({ default: 0 })
  duration!: number; // Duration of lesson in seconds

  @Column({ default: 0 })
  sortOrder!: number; // Order sequence of the lesson

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
