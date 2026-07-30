import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1785333653769 implements MigrationInterface {
  name = 'InitialSchema1785333653769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.synchronize(false);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.dropDatabase();
  }
}
