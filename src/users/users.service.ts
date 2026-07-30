import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../databaseSchema/user.schema';
import { Role } from '../databaseSchema/role.schema';
import { UserRole } from '../utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  // Create a new user with role
  async create(email: string, passwordHash: string, roleName?: UserRole): Promise<User> {
    const targetRoleName = roleName || UserRole.STUDENT;
    
    // Find the role from DB
    const role = await this.roleRepository.findOne({
      where: { name: targetRoleName.toLowerCase() },
    });

    if (!role) {
      throw new NotFoundException(`Role '${targetRoleName}' not found in the database.`);
    }

    const newUser = this.userRepository.create({
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role: role,
    });
    return this.userRepository.save(newUser);
  }

  // Update hashed refresh token for revocation
  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: refreshTokenHash || undefined });
  }
}

