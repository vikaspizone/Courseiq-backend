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
    const { role_id, moduleId, permissionIds } = createRolePermissionDto;

    // Check if role exists
    const roleExists = await this.roleRepository.findOne({ where: { id: role_id } });
    if (!roleExists) {
      throw new NotFoundException(trans('role_permission.role_not_found'));
    }

    // Check if module exists
    const moduleExists = await this.moduleRepository.findOne({ where: { id: moduleId } });
    if (!moduleExists) {
      throw new NotFoundException(trans('role_permission.module_not_found'));
    }

    // Check if relationship already exists
    const existing = await this.rolePermissionRepository.findOne({
      where: { role_id, moduleId },
    });
    if (existing) {
      throw new ConflictException(trans('role_permission.already_exists'));
    }

    // Validate permissionIds
    if (permissionIds && permissionIds.length > 0) {
      const dbPermissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });
      if (dbPermissions.length !== permissionIds.length) {
        throw new BadRequestException(trans('role_permission.invalid_permissions'));
      }
    }

    const newMapping = this.rolePermissionRepository.create({
      role_id,
      moduleId,
      permissionIds,
    });

    const saved = await this.rolePermissionRepository.save(newMapping);

    return {
      message: trans('role_permission.created'),
      data: saved,
    };
  }

  async findAll(role_id?: string): Promise<RolePermissionEntity[]> {
    const queryBuilder = this.rolePermissionRepository.createQueryBuilder('rolePermission')
      .leftJoinAndSelect('rolePermission.role', 'role')
      .leftJoinAndSelect('rolePermission.module', 'module')
      .orderBy('rolePermission.createdAt', 'DESC');

    if (role_id) {
      queryBuilder.andWhere('rolePermission.role_id = :role_id', { role_id });
    }

    return queryBuilder.getMany();
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
    const { role_id, moduleId, permissionIds } = updateRolePermissionDto;

    if (role_id && role_id !== mapping.role_id) {
      const roleExists = await this.roleRepository.findOne({ where: { id: role_id } });
      if (!roleExists) {
        throw new NotFoundException(trans('role_permission.role_not_found'));
      }
      mapping.role_id = role_id;
    }

    if (moduleId && moduleId !== mapping.moduleId) {
      const moduleExists = await this.moduleRepository.findOne({ where: { id: moduleId } });
      if (!moduleExists) {
        throw new NotFoundException(trans('role_permission.module_not_found'));
      }
      mapping.moduleId = moduleId;
    }

    // If changing role/module check conflict
    if ((role_id && role_id !== mapping.role_id) || (moduleId && moduleId !== mapping.moduleId)) {
      const conflictCheck = await this.rolePermissionRepository.findOne({
        where: { role_id: mapping.role_id, moduleId: mapping.moduleId },
      });
      if (conflictCheck && conflictCheck.id !== id) {
        throw new ConflictException(trans('role_permission.already_exists'));
      }
    }

    if (permissionIds) {
      if (permissionIds.length > 0) {
        const dbPermissions = await this.permissionRepository.find({
          where: { id: In(permissionIds) },
        });
        if (dbPermissions.length !== permissionIds.length) {
          throw new BadRequestException(trans('role_permission.invalid_permissions'));
        }
      }
      mapping.permissionIds = permissionIds;
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
