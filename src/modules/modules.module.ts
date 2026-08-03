import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleEntity } from '../databaseSchema/module.schema';
import { ModuleTranslation } from '../databaseSchema/module-translation.schema';
import { Language } from '../databaseSchema/language.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModuleEntity,
      ModuleTranslation,
      Language,
    ]),
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
