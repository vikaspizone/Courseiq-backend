import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCategory } from '../databaseSchema/course-category.schema';
import { CourseCategoryTranslation } from '../databaseSchema/course-category-translation.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class CourseCategoriesService {
  constructor(
    @InjectRepository(CourseCategory)
    private readonly categoryRepository: Repository<CourseCategory>,
    @InjectRepository(CourseCategoryTranslation)
    private readonly translationRepository: Repository<CourseCategoryTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  // Create a new category with translations
  async create(createDto: CreateCourseCategoryDto, userId: string): Promise<{ message: string; data: CourseCategory }> {

    if (createDto.parentId) {
      const parentExists = await this.categoryRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (!parentExists) {
        throw new NotFoundException(trans('category.parent_not_found'));
      }
    }

  
    const category = this.categoryRepository.create({
      status: createDto.status || 'active',
      parentId: createDto.parentId || null,
      createdBy: userId,
    });

    const savedCategory = await this.categoryRepository.save(category);


    const translations: CourseCategoryTranslation[] = [];
    for (const tDto of createDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('category.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        courseCategoryId: savedCategory.id,
        languageId: lang.id,
        title: tDto.title,
        description: tDto.description || null,
      });

      translations.push(translation);
    }

    savedCategory.translations = await this.translationRepository.save(translations);

    return {
      message: trans('category.created'),
      data: savedCategory,
    };
  }

  // Get all categories, localized to the current requested language
  async findAll(): Promise<any[]> {
    const locale = localeStorage.getStore() || 'en';
    const categories = await this.categoryRepository.find({
      relations: {
        translations: {
          language: true,
        },
      },
    });

    return categories.map((cat) => {
      let translation = cat.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = cat.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && cat.translations.length > 0) {
        translation = cat.translations[0];
      }

      return {
        id: cat.id,
        status: cat.status,
        parentId: cat.parentId,
        createdBy: cat.createdBy,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      };
    });
  }

  // Get category by ID
  async findOne(id: string): Promise<CourseCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException(trans('category.not_found'));
    }

    return category;
  }

  // Localized single view helper
  async findOneLocalized(id: string): Promise<any> {
    const cat = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = cat.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = cat.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && cat.translations.length > 0) {
      translation = cat.translations[0];
    }

    return {
      id: cat.id,
      status: cat.status,
      parentId: cat.parentId,
      createdBy: cat.createdBy,
      parent: cat.parent,
      title: translation ? translation.title : '',
      description: translation ? translation.description : '',
      translations: cat.translations,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  // Update category and its translations
  async update(id: string, updateDto: UpdateCourseCategoryDto): Promise<{ message: string; data: CourseCategory }> {
    const category = await this.findOne(id);

    // 1. Validate parent category
    if (updateDto.parentId) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parentExists = await this.categoryRepository.findOne({
        where: { id: updateDto.parentId },
      });
      if (!parentExists) {
        throw new NotFoundException(trans('category.parent_not_found'));
      }
    }

    // 2. Update category core fields
    category.status = updateDto.status || category.status;
    category.parentId = updateDto.parentId || null;

    const savedCategory = await this.categoryRepository.save(category);

    // 4. Delete existing translations that are not in the new payload, and upsert the rest
    const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
    const existingTranslations = await this.translationRepository.find({
      where: { courseCategoryId: id },
      relations: {
        language: true,
      },
    });

    // Remove translations not in update payload
    for (const extT of existingTranslations) {
      if (!payloadLangCodes.includes(extT.language.code)) {
        await this.translationRepository.remove(extT);
      }
    }

    // Upsert payload translations
    for (const tDto of updateDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('category.lang_not_found', { code: tDto.languageCode }));
      }

      const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

      if (existingT) {
        existingT.title = tDto.title;
        existingT.description = tDto.description || null;
        await this.translationRepository.save(existingT);
      } else {
        const newT = this.translationRepository.create({
          courseCategoryId: id,
          languageId: lang.id,
          title: tDto.title,
          description: tDto.description || null,
        });
        await this.translationRepository.save(newT);
      }
    }

    // Reload category with updated relations
    const updatedCategory = await this.findOne(id);

    return {
      message: trans('category.updated'),
      data: updatedCategory,
    };
  }

  // Delete a category
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);

    // Check if category has subcategories
    const childCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestException(trans('category.cannot_delete_has_children'));
    }

    await this.categoryRepository.remove(category);

    return {
      message: trans('category.deleted'),
    };
  }
}
