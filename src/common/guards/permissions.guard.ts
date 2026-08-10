import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { RolePermissionEntity } from '../../databaseSchema/role-permission.schema';
import { ModuleEntity } from '../../databaseSchema/module.schema';
import { PermissionEntity } from '../../databaseSchema/permission.schema';
import { RoutePermissionMapEntity } from '../../databaseSchema/route-permission-map.schema';
import { trans } from '../../utils/trans';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(trans('auth.token_invalid'));
    }

    // Admin role bypasses all permission checks
    if (user.role.name === 'admin') {
      return true;
    }

    const roleId = user.role.id;
    const method = request.method;
    const routePath = request.route?.path; // e.g. "/roles/:id" or "/roles"

    console.log(`[PermissionsGuard Debug] Role: ${user.role.name}, Method: ${method}, Path: ${routePath}`);

    let requiredPermissionCodes: string[] = [];

    // 1. Try to find the permission code from database mapping
    if (routePath) {
      const routeMap = await this.dataSource.getRepository(RoutePermissionMapEntity).findOne({
        where: { method, route: routePath },
        relations: {
          permission: true,
        },
      });
      if (routeMap && routeMap.permission && routeMap.permission.code) {
        requiredPermissionCodes = [routeMap.permission.code];
      }
    }

    console.log(`[PermissionsGuard Debug] Required permissions for path:`, requiredPermissionCodes);

    // If no permission is required (no database mapping), let the request pass
    if (requiredPermissionCodes.length === 0) {
      console.log(`[PermissionsGuard Debug] No database mapping found for path, allowing access`);
      return true;
    }

    // Resolve accessed module from request route path
    let moduleId: string | null = null;
    if (routePath) {
      const segments = routePath.split('/').filter(Boolean);
      const modulePrefix = segments.length > 0 ? `/${segments[0]}` : '/';

      // Find module matching this prefix
      const moduleEntity = await this.dataSource.getRepository(ModuleEntity).findOne({
        where: { route: modulePrefix },
      });
      if (moduleEntity) {
        moduleId = moduleEntity.id;
      }
    }

    // Fetch all role permission mappings for this user's role scoped to the module
    let rolePermissions: RolePermissionEntity[] = [];
    if (moduleId) {
      rolePermissions = await this.dataSource.getRepository(RolePermissionEntity).find({
        where: { role_id: roleId, module_id: moduleId },
      });

      // If a module was resolved, but no permissions exist for this role on this module, deny access immediately
      if (rolePermissions.length === 0) {
        throw new ForbiddenException(trans('common.forbidden'));
      }
    } else {
      // Fallback to global role permissions only if no module match was resolved for the path
      rolePermissions = await this.dataSource.getRepository(RolePermissionEntity).find({
        where: { role_id: roleId },
      });
    }

    if (!rolePermissions || rolePermissions.length === 0) {
      throw new ForbiddenException(trans('common.forbidden'));
    }

    // Collect all permission UUIDs assigned to this role
    const allPermissionIds = new Set<string>();
    for (const rp of rolePermissions) {
      if (rp.permission_ids && Array.isArray(rp.permission_ids)) {
        rp.permission_ids.forEach((id) => allPermissionIds.add(id));
      }
    }

    if (allPermissionIds.size === 0) {
      throw new ForbiddenException(trans('common.forbidden'));
    }

    // Fetch permissions to retrieve codes
    const permissions = await this.dataSource.getRepository(PermissionEntity).find({
      where: {
        id: In(Array.from(allPermissionIds)),
        is_active: true,
      },
    });

    const userPermissionCodes = permissions.map((p) => p.code?.trim().toLowerCase()).filter(Boolean);

    // Verify if all required permissions exist in user's permissions
    const hasAllPermissions = requiredPermissionCodes.every((perm) =>
      userPermissionCodes.includes(perm.trim().toLowerCase()),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(trans('common.forbidden'));
    }

    return true;
  }
}
