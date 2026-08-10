import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../databaseSchema/role.schema';
import { User } from '../databaseSchema/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { trans } from '../utils/trans';
import { paginate } from '../utils/pagination.helper';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new role
  async create(createRoleDto: CreateRoleDto): Promise<{ message: string; data: Role }> {
    const nameLower = createRoleDto.name.toLowerCase().trim();

    const existingRole = await this.roleRepository.findOne({
      where: { name: nameLower },
    });

    if (existingRole) {
      throw new ConflictException(trans('role.already_exists'));
    }

    const newRole = this.roleRepository.create({
      name: nameLower,
      is_active: createRoleDto.is_active !== undefined ? createRoleDto.is_active : true,
    });
    const savedRole = await this.roleRepository.save(newRole);

    return {
      message: trans('role.created'),
      data: savedRole,
    };
  }

  // Get all roles
  async findAll(options: { page?: number; limit?: number }): Promise<any> {
    return paginate(this.roleRepository, options);
  }

  // Get role by ID
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(trans('role.not_found'));
    }
    return role;
  }

  // Update an existing role
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<{ message: string; data: Role }> {
    const role = await this.findOne(id);
    const nameLower = updateRoleDto.name.toLowerCase().trim();

    if (role.name !== nameLower) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: nameLower },
      });

      if (existingRole) {
        throw new ConflictException(trans('role.already_exists'));
      }
    }

    role.name = nameLower;
    if (updateRoleDto.is_active !== undefined) {
      role.is_active = updateRoleDto.is_active;
    }
    const updatedRole = await this.roleRepository.save(role);

    return {
      message: trans('role.updated'),
      data: updatedRole,
    };
  }

  // Delete a role
  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);

    // Prevent deleting default system roles
    const systemRoles = ['admin', 'instructor', 'student'];
    if (systemRoles.includes(role.name)) {
      throw new BadRequestException(trans('role.cannot_delete_system_role'));
    }

    // Check if the role is assigned to any user
    const usersCount = await this.userRepository.count({
      where: { role_id: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(trans('role.cannot_delete_in_use'));
    }

    await this.roleRepository.remove(role);

    return {
      message: trans('role.deleted'),
    };
  }
}
