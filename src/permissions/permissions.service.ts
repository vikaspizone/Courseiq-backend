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
      isActive: createPermissionDto.isActive !== undefined ? createPermissionDto.isActive : true,
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
        permissionId: savedPermission.id,
        languageId: lang.id,
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

  async findAll(): Promise<any[]> {
    const locale = localeStorage.getStore() || 'en';
    const permissions = await this.permissionRepository.find({
      relations: {
        translations: {
          language: true,
        },
      },
    });

    return permissions.map((perm) => {
      let translation = perm.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = perm.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && perm.translations.length > 0) {
        translation = perm.translations[0];
      }

      return {
        id: perm.id,
        isActive: perm.isActive,
        name: translation ? translation.name : '',
        createdAt: perm.createdAt,
        updatedAt: perm.updatedAt,
      };
    });
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
      isActive: perm.isActive,
      name: translation ? translation.name : '',
      translations: perm.translations,
      createdAt: perm.createdAt,
      updatedAt: perm.updatedAt,
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<{ message: string; data: any }> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.isActive !== undefined) {
      permission.isActive = updatePermissionDto.isActive;
    }

    const savedPermission = await this.permissionRepository.save(permission);

    if (updatePermissionDto.translations) {
      const payloadLangCodes = updatePermissionDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { permissionId: id },
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
        if (conflict && conflict.permissionId !== id) {
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
            permissionId: id,
            languageId: lang.id,
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
