import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionEntity } from '../databaseSchema/permission.schema';
import { PermissionTranslation } from '../databaseSchema/permission-translation.schema';
import { Language } from '../databaseSchema/language.schema';
import { RoutePermissionMapEntity } from '../databaseSchema/route-permission-map.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      PermissionTranslation,
      Language,
      RoutePermissionMapEntity,
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
