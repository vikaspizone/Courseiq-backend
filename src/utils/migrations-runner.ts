import { DataSource } from 'typeorm';
import { INestApplication, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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
      const defaultRoles = ['admin', 'instructor', 'student'];
      for (const roleName of defaultRoles) {
        const roleExists = await queryRunner.query(
          `SELECT 1 FROM "roles" WHERE "name" = $1`,
          [roleName],
        );
        if (roleExists.length === 0) {
          logger.log(`Seeding default role: ${roleName}`);
          await queryRunner.query(
            `INSERT INTO "roles" ("id", "name", "created_at", "updated_at") VALUES ($1, $2, now(), now())`,
            [crypto.randomUUID(), roleName],
          );
        }
      }
    }

    // Check and seed languages (English & Hindi only)
    const hasLanguagesTable = await queryRunner.hasTable('languages');
    if (hasLanguagesTable) {
      const defaultLanguages = [
        { name: 'English', code: 'en' },
        { name: 'Hindi', code: 'hi' },
      ];
      for (const lang of defaultLanguages) {
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
      const adminEmail = 'admin@courseiq.com';
      const adminExists = await queryRunner.query(
        `SELECT 1 FROM "users" WHERE "email" = $1`,
        [adminEmail],
      );

      if (adminExists.length === 0) {
        // Fetch the admin role ID
        const adminRole = await queryRunner.query(
          `SELECT "id" FROM "roles" WHERE "name" = 'admin' LIMIT 1`,
        );

        if (adminRole && adminRole.length > 0) {
          const roleId = adminRole[0].id;
          const passwordHash = await bcrypt.hash('Admin@123', 10);
          logger.log(`Seeding default admin user: ${adminEmail}`);
          await queryRunner.query(
            `INSERT INTO "users" ("id", "email", "password", "role_id", "created_at", "updated_at") VALUES ($1, $2, $3, $4, now(), now())`,
            [crypto.randomUUID(), adminEmail, passwordHash, roleId],
          );
        } else {
          logger.warn('Cannot seed admin user: "admin" role not found in roles table.');
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
