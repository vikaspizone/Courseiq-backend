import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolePermissionEntity } from '../databaseSchema/role-permission.schema';
import { Role } from '../databaseSchema/role.schema';
import { ModuleEntity } from '../databaseSchema/module.schema';
import { PermissionEntity } from '../databaseSchema/permission.schema';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { trans } from '../utils/trans';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async create(createRolePermissionDto: CreateRolePermissionDto): Promise<{ message: string; data: RolePermissionEntity }> {
    const { role_id, module_id, permission_ids } = createRolePermissionDto;

    // Check if role exists
    const roleExists = await this.roleRepository.findOne({ where: { id: role_id } });
    if (!roleExists) {
      throw new NotFoundException(trans('role_permission.role_not_found'));
    }

    // Check if module exists
    const moduleExists = await this.moduleRepository.findOne({ where: { id: module_id } });
    if (!moduleExists) {
      throw new NotFoundException(trans('role_permission.module_not_found'));
    }

    // Check if relationship already exists
    const existing = await this.rolePermissionRepository.findOne({
      where: { role_id, module_id },
    });
    if (existing) {
      throw new ConflictException(trans('role_permission.already_exists'));
    }

    // Validate permission_ids
    if (permission_ids && permission_ids.length > 0) {
      const dbPermissions = await this.permissionRepository.find({
        where: { id: In(permission_ids) },
      });
      if (dbPermissions.length !== permission_ids.length) {
        throw new BadRequestException(trans('role_permission.invalid_permissions'));
      }
    }

    const newMapping = this.rolePermissionRepository.create({
      role_id,
      module_id,
      permission_ids,
    });

    const saved = await this.rolePermissionRepository.save(newMapping);

    return {
      message: trans('role_permission.created'),
      data: saved,
    };
  }

  async findAll(options: { page?: number; limit?: number }, role_id?: string): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.rolePermissionRepository.createQueryBuilder('rolePermission')
      .leftJoinAndSelect('rolePermission.role', 'role')
      .leftJoinAndSelect('rolePermission.module', 'module')
      .orderBy('rolePermission.created_at', 'DESC');

    if (role_id) {
      queryBuilder.andWhere('rolePermission.role_id = :role_id', { role_id });
    }

    const [items, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: string): Promise<RolePermissionEntity> {
    const mapping = await this.rolePermissionRepository.findOne({
      where: { id },
      relations: { role: true, module: true },
    });
    if (!mapping) {
      throw new NotFoundException(trans('role_permission.not_found'));
    }
    return mapping;
  }

  async update(id: string, updateRolePermissionDto: UpdateRolePermissionDto): Promise<{ message: string; data: RolePermissionEntity }> {
    const mapping = await this.findOne(id);
    const { role_id, module_id, permission_ids } = updateRolePermissionDto;

    if (role_id && role_id !== mapping.role_id) {
      const roleExists = await this.roleRepository.findOne({ where: { id: role_id } });
      if (!roleExists) {
        throw new NotFoundException(trans('role_permission.role_not_found'));
      }
      mapping.role_id = role_id;
    }

    if (module_id && module_id !== mapping.module_id) {
      const moduleExists = await this.moduleRepository.findOne({ where: { id: module_id } });
      if (!moduleExists) {
        throw new NotFoundException(trans('role_permission.module_not_found'));
      }
      mapping.module_id = module_id;
    }

    // If changing role/module check conflict
    if ((role_id && role_id !== mapping.role_id) || (module_id && module_id !== mapping.module_id)) {
      const conflictCheck = await this.rolePermissionRepository.findOne({
        where: { role_id: mapping.role_id, module_id: mapping.module_id },
      });
      if (conflictCheck && conflictCheck.id !== id) {
        throw new ConflictException(trans('role_permission.already_exists'));
      }
    }

    if (permission_ids) {
      if (permission_ids.length > 0) {
        const dbPermissions = await this.permissionRepository.find({
          where: { id: In(permission_ids) },
        });
        if (dbPermissions.length !== permission_ids.length) {
          throw new BadRequestException(trans('role_permission.invalid_permissions'));
        }
      }
      mapping.permission_ids = permission_ids;
    }

    const updated = await this.rolePermissionRepository.save(mapping);

    return {
      message: trans('role_permission.updated'),
      data: updated,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const mapping = await this.findOne(id);
    await this.rolePermissionRepository.remove(mapping);
    return {
      message: trans('role_permission.deleted'),
    };
  }
}
