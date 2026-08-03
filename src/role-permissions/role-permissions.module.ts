import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionEntity } from '../databaseSchema/role-permission.schema';
import { Role } from '../databaseSchema/role.schema';
import { ModuleEntity } from '../databaseSchema/module.schema';
import { PermissionEntity } from '../databaseSchema/permission.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolePermissionEntity,
      Role,
      ModuleEntity,
      PermissionEntity,
    ]),
  ],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
