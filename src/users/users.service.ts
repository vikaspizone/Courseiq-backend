import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../databaseSchema/user.schema';
import { Role } from '../databaseSchema/role.schema';
import { UserRole } from '../utils/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { trans } from '../utils/trans';
import * as bcrypt from 'bcrypt';

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

  // Create a new user with role (Used in signup)
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
      name: email.split('@')[0], // Default name from email
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

  // ==========================================
  // USER CRUD OPERATIONS (FOR ADMIN / API)
  // ==========================================

  // Create a user from admin/API with full parameters
  async createUser(createUserDto: CreateUserDto, currentUserId?: string): Promise<any> {
    const emailLower = createUserDto.email.toLowerCase().trim();

    // Check if email already exists
    const emailExists = await this.findByEmail(emailLower);
    if (emailExists) {
      throw new ConflictException(trans('user.email_exists'));
    }

    // Verify role exists
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId },
    });
    if (!role) {
      throw new NotFoundException(trans('user.role_not_found'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      name: createUserDto.name,
      email: emailLower,
      password: hashedPassword,
      phone: createUserDto.phone,
      gender: createUserDto.gender,
      profileImage: createUserDto.profileImage,
      about: createUserDto.about,
      dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : undefined,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
      qualification: createUserDto.qualification,
      experience: createUserDto.experience,
      languages: createUserDto.languages,
      address: createUserDto.address,
      work: createUserDto.work,
      roleId: createUserDto.roleId,
      createdBy: currentUserId,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Return user without password
    const { password, refreshToken, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  // Find all users
  async findAllUsers(): Promise<any[]> {
    const users = await this.userRepository.find({
      relations: {
        role: true,
      },
    });

    return users.map(({ password, refreshToken, ...userWithoutPassword }) => userWithoutPassword);
  }

  // Find user by ID
  async findOneUser(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(trans('user.not_found'));
    }

    const { password, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user by ID
  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUserId?: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(trans('user.not_found'));
    }

    // Email check
    if (updateUserDto.email) {
      const emailLower = updateUserDto.email.toLowerCase().trim();
      if (user.email !== emailLower) {
        const emailExists = await this.findByEmail(emailLower);
        if (emailExists) {
          throw new ConflictException(trans('user.email_exists'));
        }
        user.email = emailLower;
      }
    }

    // Role check
    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });
      if (!role) {
        throw new NotFoundException(trans('user.role_not_found'));
      }
      user.roleId = updateUserDto.roleId;
    }

    // Password hashing if updated
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Map other optional properties
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
    if (updateUserDto.gender !== undefined) user.gender = updateUserDto.gender;
    if (updateUserDto.profileImage !== undefined) user.profileImage = updateUserDto.profileImage;
    if (updateUserDto.about !== undefined) user.about = updateUserDto.about;
    if (updateUserDto.dateOfBirth !== undefined) {
      user.dateOfBirth = updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : undefined;
    }
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;
    if (updateUserDto.qualification !== undefined) user.qualification = updateUserDto.qualification;
    if (updateUserDto.experience !== undefined) user.experience = updateUserDto.experience;
    if (updateUserDto.languages !== undefined) user.languages = updateUserDto.languages;
    if (updateUserDto.address !== undefined) user.address = updateUserDto.address;
    if (updateUserDto.work !== undefined) user.work = updateUserDto.work;

    // Track updater
    user.updatedBy = currentUserId;

    const updatedUser = await this.userRepository.save(user);

    // Reload user with role relation loaded
    return this.findOneUser(updatedUser.id);
  }

  // Delete user by ID
  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(trans('user.not_found'));
    }

    await this.userRepository.remove(user);

    return {
      message: trans('user.deleted'),
    };
  }
}
