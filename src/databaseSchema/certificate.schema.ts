import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.schema';
import { Course } from './course.schema';

@Entity('certificates')
@Unique(['code'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string; // Public unique verification code (e.g. CIQ-XXXX-XXXX)

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  courseId!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  pdfUrl!: string; // Generated PDF certificate uploaded to S3

  @CreateDateColumn({ type: 'timestamp' })
  issuedAt!: Date;
}
