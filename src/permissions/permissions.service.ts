import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../databaseSchema/permission.schema';
import { PermissionTranslation } from '../databaseSchema/permission-translation.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(PermissionTranslation)
    private readonly translationRepository: Repository<PermissionTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<{ message: string; data: any }> {
    // Check if the permission code already exists
    const codeNormalized = createPermissionDto.code.trim();
    const existingCode = await this.permissionRepository.findOne({
      where: { code: codeNormalized },
    });
    if (existingCode) {
      throw new ConflictException(trans('permission.code_exists', { code: createPermissionDto.code }));
    }

    // Check if any of the provided names already exist in the database
    for (const tDto of createPermissionDto.translations) {
      const nameNormalized = tDto.name.trim();
      const existingTranslation = await this.translationRepository.findOne({
        where: { name: nameNormalized },
      });
      if (existingTranslation) {
        throw new ConflictException(trans('permission.already_exists', { name: nameNormalized }));
      }
    }

    const newPermission = this.permissionRepository.create({
      code: codeNormalized,
      is_active: createPermissionDto.is_active !== undefined ? createPermissionDto.is_active : true,
    });

    const savedPermission = await this.permissionRepository.save(newPermission);

    const translations: PermissionTranslation[] = [];
    for (const tDto of createPermissionDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('permission.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        permission_id: savedPermission.id,
        language_id: lang.id,
        name: tDto.name.trim(),
      });

      translations.push(translation);
    }

    savedPermission.translations = await this.translationRepository.save(translations);

    return {
      message: trans('permission.created'),
      data: savedPermission,
    };
  }

  async findAll(options: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.permissionRepository.findAndCount({
      relations: {
        translations: {
          language: true,
        },
      },
      skip,
      take: limit,
    });

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((perm) => {
      let translation = perm.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = perm.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && perm.translations.length > 0) {
        translation = perm.translations[0];
      }

      return {
        id: perm.id,
        code: perm.code,
        is_active: perm.is_active,
        name: translation ? translation.name : '',
        created_at: perm.created_at,
        updated_at: perm.updated_at,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: mappedItems,
      meta: {
        totalItems,
        itemCount: mappedItems.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
      },
    });
    if (!permission) {
      throw new NotFoundException(trans('permission.not_found'));
    }
    return permission;
  }

  async findOneLocalized(id: string): Promise<any> {
    const perm = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = perm.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = perm.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && perm.translations.length > 0) {
      translation = perm.translations[0];
    }

    return {
      id: perm.id,
      code: perm.code,
      is_active: perm.is_active,
      name: translation ? translation.name : '',
      translations: perm.translations,
      created_at: perm.created_at,
      updated_at: perm.updated_at,
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<{ message: string; data: any }> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.code !== undefined) {
      const codeNormalized = updatePermissionDto.code.trim();
      const existingCode = await this.permissionRepository.findOne({
        where: { code: codeNormalized },
      });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(trans('permission.code_exists', { code: updatePermissionDto.code }));
      }
      permission.code = codeNormalized;
    }

    if (updatePermissionDto.is_active !== undefined) {
      permission.is_active = updatePermissionDto.is_active;
    }

    const savedPermission = await this.permissionRepository.save(permission);

    if (updatePermissionDto.translations) {
      const payloadLangCodes = updatePermissionDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { permission_id: id },
        relations: {
          language: true,
        },
      });

      // Check unique constraint for names in the payload
      for (const tDto of updatePermissionDto.translations) {
        const nameNormalized = tDto.name.trim();
        const conflict = await this.translationRepository.findOne({
          where: { name: nameNormalized },
        });
        if (conflict && conflict.permission_id !== id) {
          throw new ConflictException(trans('permission.already_exists', { name: nameNormalized }));
        }
      }

      // Remove translations not in update payload
      for (const extT of existingTranslations) {
        if (!payloadLangCodes.includes(extT.language.code)) {
          await this.translationRepository.remove(extT);
        }
      }

      // Upsert payload translations
      for (const tDto of updatePermissionDto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { code: tDto.languageCode },
        });

        if (!lang) {
          throw new NotFoundException(trans('permission.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.name = tDto.name.trim();
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            permission_id: id,
            language_id: lang.id,
            name: tDto.name.trim(),
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    // Reload permission with updated relations
    const updatedPermission = await this.findOne(id);

    return {
      message: trans('permission.updated'),
      data: updatedPermission,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
    return {
      message: trans('permission.deleted'),
    };
  }
}
