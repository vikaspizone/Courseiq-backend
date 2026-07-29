import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('blacklisted_tokens')
export class BlacklistedToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  @Index({ unique: true })
  token!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date; // The time when the token naturally expires

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
