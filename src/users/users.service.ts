import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../databaseSchema/user.schema';
import { UserRole } from '../utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  // Create a new user with role
  async create(email: string, passwordHash: string, role?: UserRole): Promise<User> {
    const newUser = this.userRepository.create({
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role: role || UserRole.STUDENT,
    });
    return this.userRepository.save(newUser);
  }

  // Update hashed refresh token for revocation
  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: refreshTokenHash || undefined });
  }
}

