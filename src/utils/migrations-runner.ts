import { DataSource } from 'typeorm';
import { INestApplication, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  DEFAULT_LANGUAGES,
  DEFAULT_ROLES,
  DEFAULT_ADMIN_USER,
  DEFAULT_MODULES,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROUTE_PERMISSION_MAPS,
  DEFAULT_ROLE_PERMISSIONS,
} from './seed-data';

const logger = new Logger('MigrationRunner');

/**
 * Seed default roles, languages, and a default admin user programmatically.
 */
async function seedDefaultRolesAndLanguages(dataSource: DataSource) {
  try {
    const queryRunner = dataSource.createQueryRunner();

    // Check and seed roles
    const hasRolesTable = await queryRunner.hasTable('roles');
    if (hasRolesTable) {
      for (const role of DEFAULT_ROLES) {
        const roleExists = await queryRunner.query(
          `SELECT 1 FROM "roles" WHERE "name" = $1`,
          [role.name],
        );
        if (roleExists.length === 0) {
          logger.log(`Seeding default role: ${role.name}`);
          await queryRunner.query(
            `INSERT INTO "roles" ("id", "name", "created_at", "updated_at") VALUES ($1, $2, now(), now())`,
            [crypto.randomUUID(), role.name],
          );
        }
      }
    }

    // Check and seed languages (English & Hindi only)
    const hasLanguagesTable = await queryRunner.hasTable('languages');
    if (hasLanguagesTable) {
      for (const lang of DEFAULT_LANGUAGES) {
        const langExists = await queryRunner.query(
          `SELECT 1 FROM "languages" WHERE "code" = $1`,
          [lang.code],
        );
        if (langExists.length === 0) {
          logger.log(`Seeding default language: ${lang.name} (${lang.code})`);
          await queryRunner.query(
            `INSERT INTO "languages" ("id", "name", "code", "created_at", "updated_at") VALUES ($1, $2, $3, now(), now())`,
            [crypto.randomUUID(), lang.name, lang.code],
          );
        }
      }
    }

    // Check and seed default admin user
    const hasUsersTable = await queryRunner.hasTable('users');
    if (hasUsersTable && hasRolesTable) {
      const adminEmail = DEFAULT_ADMIN_USER.email;
      const adminExists = await queryRunner.query(
        `SELECT 1 FROM "users" WHERE "email" = $1`,
        [adminEmail],
      );

      if (adminExists.length === 0) {
        // Fetch the admin role ID
        const adminRole = await queryRunner.query(
          `SELECT "id" FROM "roles" WHERE "name" = $1 LIMIT 1`,
          [DEFAULT_ADMIN_USER.roleName],
        );

        if (adminRole && adminRole.length > 0) {
          const roleId = adminRole[0].id;
          const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_USER.password, 10);
          logger.log(`Seeding default admin user: ${adminEmail}`);
          await queryRunner.query(
            `INSERT INTO "users" ("id", "email", "password", "role_id", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
            [crypto.randomUUID(), adminEmail, passwordHash, roleId],
          );
        } else {
          logger.warn(`Cannot seed admin user: "${DEFAULT_ADMIN_USER.roleName}" role not found in roles table.`);
        }
      }
    }

    await queryRunner.release();
  } catch (err) {
    logger.error('Failed to seed default roles, languages, or admin user', err);
  }
}

/**
 * Log details of migrations run (or failed) including a list of current tables in the database.
 */
async function logMigrationStatus(dataSource: DataSource, executedMigrations: any[], error: any) {
  try {
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    await queryRunner.release();

    const tableNames = tables.map((t) => t.name);
    const today = new Date().toISOString().split('T')[0];
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFilePath = path.join(
      logDir,
      error ? `migration-error-${today}.log` : `migration-success-${today}.log`,
    );

    const statusMessage = `
================================================================================
MIGRATION REPORT - ${new Date().toISOString()}
================================================================================
Status: ${error ? 'FAILED' : 'SUCCESS'}

Executed Migrations in this run:
${executedMigrations.length > 0 ? executedMigrations.map((m) => `- ${m.name}`).join('\n') : 'None'}

Current Tables in Database:
${tableNames.length > 0 ? tableNames.map((name) => `- ${name}`).join('\n') : 'No tables found'}
${
  error
    ? `
Error Details:
Message: ${error.message || error}
Query: ${error.query || 'N/A'}
Parameters: ${error.parameters ? JSON.stringify(error.parameters) : 'N/A'}
Stack Trace:
${error.stack || 'N/A'}
`
    : ''
}
================================================================================
`;

    fs.appendFileSync(logFilePath, statusMessage, 'utf8');
  } catch (logErr) {
    logger.error('Failed to log migration status details', logErr);
  }
}

async function seedPermissionsAndRoleMappings(dataSource: DataSource) {
  try {
    const queryRunner = dataSource.createQueryRunner();

    const hasModulesTable = await queryRunner.hasTable('modules');
    const hasPermissionsTable = await queryRunner.hasTable('permissions');
    const hasPermissionTranslationsTable = await queryRunner.hasTable('permission_translations');
    const hasRolePermissionsTable = await queryRunner.hasTable('role_permissions');
    const hasRolesTable = await queryRunner.hasTable('roles');
    const hasLanguagesTable = await queryRunner.hasTable('languages');

    if (
      hasModulesTable &&
      hasPermissionsTable &&
      hasPermissionTranslationsTable &&
      hasRolePermissionsTable &&
      hasRolesTable &&
      hasLanguagesTable
    ) {
      // Fetch languages
      const languages = await queryRunner.query(`SELECT "id", "code" FROM "languages"`);
      const enLang = languages.find((l) => l.code === 'en');
      const hiLang = languages.find((l) => l.code === 'hi');

      if (!enLang || !hiLang) {
        logger.warn('Languages "en" or "hi" not found, skipping permission seeding.');
        await queryRunner.release();
        return;
      }

      // Fetch roles
      const roles = await queryRunner.query(`SELECT "id", "name" FROM "roles"`);
      const instructorRole = roles.find((r) => r.name === 'instructor');
      const studentRole = roles.find((r) => r.name === 'student');

      if (!instructorRole || !studentRole) {
        logger.warn('Default roles not fully seeded, skipping permission mapping seeding.');
        await queryRunner.release();
        return;
      }

      // Seed all modules from config
      const moduleRouteToId: Record<string, string> = {};

      for (const m of DEFAULT_MODULES) {
        let moduleId = '';
        const moduleCheck = await queryRunner.query(`SELECT "id" FROM "modules" WHERE "route" = $1 LIMIT 1`, [m.route]);
        if (moduleCheck.length > 0) {
          moduleId = moduleCheck[0].id;
        } else {
          moduleId = crypto.randomUUID();
          logger.log(`Seeding module: ${m.route} (${moduleId})`);
          await queryRunner.query(
            `INSERT INTO "modules" ("id", "is_active", "icon", "route", "sort_order", "created_at", "updated_at") VALUES ($1, true, $2, $3, $4, now(), now())`,
            [moduleId, m.icon, m.route, m.sortOrder],
          );
          // Seed translation for module
          const moduleTransIdEn = crypto.randomUUID();
          const moduleTransIdHi = crypto.randomUUID();
          await queryRunner.query(
            `INSERT INTO "module_translations" ("id", "module_id", "language_id", "name", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now()), ($5, $2, $6, $7, now(), now())`,
            [moduleTransIdEn, moduleId, enLang.id, m.nameEn, moduleTransIdHi, hiLang.id, m.nameHi],
          );
        }
        moduleRouteToId[m.route] = moduleId;
      }

      const rolesModuleId = moduleRouteToId['/roles'];

      // Clear old data in permission_translations, permissions, and role_permissions to ensure fresh start
      logger.log('Clearing old permissions, role permissions, and route mappings...');
      const hasRoutePermissionMapsTable = await queryRunner.hasTable('route_permission_maps');
      if (hasRoutePermissionMapsTable) {
        await queryRunner.query(`DELETE FROM "route_permission_maps"`);
      }
      await queryRunner.query(`DELETE FROM "role_permissions"`);
      await queryRunner.query(`DELETE FROM "permission_translations"`);
      await queryRunner.query(`DELETE FROM "permissions"`);

      // Seed all Permissions from config
      const permissionCodeToId: Record<string, string> = {};

      for (const item of DEFAULT_PERMISSIONS) {
        const permId = crypto.randomUUID();
        logger.log(`Seeding permission: ${item.code} (${permId})`);
        await queryRunner.query(
          `INSERT INTO "permissions" ("id", "code", "is_active", "created_at", "updated_at") VALUES ($1, $2, true, now(), now())`,
          [permId, item.code],
        );

        // Insert English translation
        const transIdEn = crypto.randomUUID();
        await queryRunner.query(
          `INSERT INTO "permission_translations" ("id", "permission_id", "language_id", "name", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
          [transIdEn, permId, enLang.id, item.en],
        );

        // Insert Hindi translation
        const transIdHi = crypto.randomUUID();
        await queryRunner.query(
          `INSERT INTO "permission_translations" ("id", "permission_id", "language_id", "name", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
          [transIdHi, permId, hiLang.id, item.hi],
        );

        permissionCodeToId[item.code] = permId;
      }

      // Seed default route permission mappings
      if (hasRoutePermissionMapsTable) {
        logger.log('Seeding default route permission mappings for all controllers...');
        for (const mapItem of DEFAULT_ROUTE_PERMISSION_MAPS) {
          const permId = permissionCodeToId[mapItem.permission_code];
          if (permId) {
            await queryRunner.query(
              `INSERT INTO "route_permission_maps" ("id", "method", "route", "permission_id", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
              [crypto.randomUUID(), mapItem.method, mapItem.route, permId],
            );
          }
        }
      }

      // Seed Role Permissions dynamically for all modules
      for (const roleDef of DEFAULT_ROLE_PERMISSIONS) {
        const roleEntity = roles.find((r) => r.name === roleDef.roleName);
        if (!roleEntity) {
          continue;
        }

        for (const moduleRoute of Object.keys(moduleRouteToId)) {
          const moduleId = moduleRouteToId[moduleRoute];
          if (!moduleId) continue;

          // Determine permissions: check overrides, fallback to defaultPermissionCodes
          const codes = roleDef.overrides[moduleRoute] !== undefined
            ? roleDef.overrides[moduleRoute]
            : roleDef.defaultPermissionCodes;

          const permIds = codes
            .map((code) => permissionCodeToId[code])
            .filter(Boolean);

          const permIdsJson = JSON.stringify(permIds);

          const mapping = await queryRunner.query(
            `SELECT "id" FROM "role_permissions" WHERE "role_id" = $1 AND "module_id" = $2`,
            [roleEntity.id, moduleId],
          );

          if (mapping.length > 0) {
            await queryRunner.query(
              `UPDATE "role_permissions" SET "permission_ids" = $1, "updated_at" = now() WHERE "id" = $2`,
              [permIdsJson, mapping[0].id],
            );
          } else {
            await queryRunner.query(
              `INSERT INTO "role_permissions" ("id", "role_id", "module_id", "permission_ids", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
              [crypto.randomUUID(), roleEntity.id, moduleId, permIdsJson],
            );
          }
        }
      }
    }

    await queryRunner.release();
  } catch (err) {
    logger.error('Failed to seed permissions and role mappings', err);
  }
}

/**
 * Programmatically execute database migrations and log reports on success/failure.
 */
export async function runDatabaseMigrations(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);

  try {
    logger.log('Starting programmatic database migrations...');
    const runMigrations = await dataSource.runMigrations();

    // Seed default records if migrations executed or database is verified
    await seedDefaultRolesAndLanguages(dataSource);
    await seedPermissionsAndRoleMappings(dataSource);

    if (runMigrations && runMigrations.length > 0) {
      logger.log(`Successfully executed ${runMigrations.length} migrations.`);
      await logMigrationStatus(dataSource, runMigrations, null);
    } else {
      logger.log('No new migrations to execute.');
    }
  } catch (error) {
    const err = error as any;
    logger.error('Database migration failed! Writing error report to log file...', err?.stack);
    await logMigrationStatus(dataSource, [], err);
    // Exit application on failed migrations to ensure safe production state
    process.exit(1);
  }
}
