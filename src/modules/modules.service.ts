import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleEntity } from '../databaseSchema/module.schema';
import { ModuleTranslation } from '../databaseSchema/module-translation.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    @InjectRepository(ModuleTranslation)
    private readonly translationRepository: Repository<ModuleTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<{ message: string; data: any }> {
    // Check if any of the provided names already exist in the database
    for (const tDto of createModuleDto.translations) {
      const nameNormalized = tDto.name.trim();
      const existingTranslation = await this.translationRepository.findOne({
        where: { name: nameNormalized },
      });
      if (existingTranslation) {
        throw new ConflictException(trans('module.already_exists', { name: nameNormalized }));
      }
    }

    let sortOrder = createModuleDto.sort_order;
    if (sortOrder === undefined || sortOrder === null) {
      const maxSortOrder = await this.moduleRepository
        .createQueryBuilder('module')
        .select('MAX(module.sort_order)', 'max')
        .getRawOne();
      const currentMax = maxSortOrder && maxSortOrder.max !== null ? Number(maxSortOrder.max) : -1;
      sortOrder = currentMax + 1;
    }

    const newModule = this.moduleRepository.create({
      is_active: createModuleDto.is_active !== undefined ? createModuleDto.is_active : true,
      icon: createModuleDto.icon !== undefined ? createModuleDto.icon : null,
      route: createModuleDto.route !== undefined ? createModuleDto.route : null,
      sort_order: sortOrder,
    });

    const savedModule = await this.moduleRepository.save(newModule);

    const translations: ModuleTranslation[] = [];
    for (const tDto of createModuleDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('module.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        module_id: savedModule.id,
        language_id: lang.id,
        name: tDto.name.trim(),
      });

      translations.push(translation);
    }

    savedModule.translations = await this.translationRepository.save(translations);

    return {
      message: trans('module.created'),
      data: savedModule,
    };
  }

  async findAll(options: { page?: number; limit?: number; search?: string }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.moduleRepository.createQueryBuilder('module')
      .leftJoinAndSelect('module.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .orderBy('module.sort_order', 'ASC');

    if (options.search) {
      queryBuilder.andWhere(
        '(LOWER(module.route) LIKE LOWER(:search) OR LOWER(translation.name) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    const [items, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((mod) => {
      let translation = mod.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = mod.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && mod.translations.length > 0) {
        translation = mod.translations[0];
      }

      return {
        id: mod.id,
        is_active: mod.is_active,
        icon: mod.icon,
        route: mod.route,
        sort_order: mod.sort_order,
        name: translation ? translation.name : '',
        created_at: mod.created_at,
        updated_at: mod.updated_at,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: mappedItems,
      pagination: {
        totalItems,
        itemCount: mappedItems.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ModuleEntity> {
    const moduleItem = await this.moduleRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
      },
    });
    if (!moduleItem) {
      throw new NotFoundException(trans('module.not_found'));
    }
    return moduleItem;
  }

  async findOneLocalized(id: string): Promise<any> {
    const mod = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = mod.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = mod.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && mod.translations.length > 0) {
      translation = mod.translations[0];
    }

    return {
      id: mod.id,
      is_active: mod.is_active,
      icon: mod.icon,
      route: mod.route,
      sort_order: mod.sort_order,
      name: translation ? translation.name : '',
      created_at: mod.created_at,
      updated_at: mod.updated_at,
    };
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<{ message: string; data: any }> {
    const moduleItem = await this.findOne(id);

    if (updateModuleDto.is_active !== undefined) {
      moduleItem.is_active = updateModuleDto.is_active;
    }

    if (updateModuleDto.icon !== undefined) {
      moduleItem.icon = updateModuleDto.icon;
    }

    if (updateModuleDto.route !== undefined) {
      moduleItem.route = updateModuleDto.route;
    }

    if (updateModuleDto.sort_order !== undefined) {
      moduleItem.sort_order = updateModuleDto.sort_order;
    }

    const savedModule = await this.moduleRepository.save(moduleItem);

    if (updateModuleDto.translations) {
      const payloadLangCodes = updateModuleDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { module_id: id },
        relations: {
          language: true,
        },
      });

      // Check unique constraint for names in the payload
      for (const tDto of updateModuleDto.translations) {
        const nameNormalized = tDto.name.trim();
        const conflict = await this.translationRepository.findOne({
          where: { name: nameNormalized },
        });
        if (conflict && conflict.module_id !== id) {
          throw new ConflictException(trans('module.already_exists', { name: nameNormalized }));
        }
      }

      // Remove translations not in update payload
      for (const extT of existingTranslations) {
        if (!payloadLangCodes.includes(extT.language.code)) {
          await this.translationRepository.remove(extT);
        }
      }

      // Upsert payload translations
      for (const tDto of updateModuleDto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { code: tDto.languageCode },
        });

        if (!lang) {
          throw new NotFoundException(trans('module.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.name = tDto.name.trim();
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            module_id: id,
            language_id: lang.id,
            name: tDto.name.trim(),
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    // Reload module with updated relations
    const updatedModule = await this.findOne(id);

    return {
      message: trans('module.updated'),
      data: updatedModule,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const moduleItem = await this.findOne(id);
    await this.moduleRepository.remove(moduleItem);

    // Re-sequence remaining modules (0, 1, 2...) to close the gap after deletion
    const remainingModules = await this.moduleRepository.find({
      order: { sort_order: 'ASC' },
    });

    for (let i = 0; i < remainingModules.length; i++) {
      remainingModules[i].sort_order = i;
      await this.moduleRepository.save(remainingModules[i]);
    }

    return {
      message: trans('module.deleted'),
    };
  }
}
