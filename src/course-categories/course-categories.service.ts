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

    if (createDto.parent_id) {
      const parentExists = await this.categoryRepository.findOne({
        where: { id: createDto.parent_id },
      });
      if (!parentExists) {
        throw new NotFoundException(trans('category.parent_not_found'));
      }
    }

  
    const category = this.categoryRepository.create({
      is_active: createDto.is_active !== undefined ? createDto.is_active : true,
      parent_id: createDto.parent_id || null,
      created_by: userId,
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
        course_category_id: savedCategory.id,
        language_id: lang.id,
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
  async findAll(options: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.categoryRepository.findAndCount({
      relations: {
        translations: {
          language: true,
        },
      },
      skip,
      take: limit,
    });

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((cat) => {
      let translation = cat.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = cat.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && cat.translations.length > 0) {
        translation = cat.translations[0];
      }

      return {
        id: cat.id,
        is_active: cat.is_active,
        parent_id: cat.parent_id,
        created_by: cat.created_by,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        created_at: cat.created_at,
        updated_at: cat.updated_at,
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
       is_active: cat.is_active,
       parent_id: cat.parent_id,
       created_by: cat.created_by,
       parent: cat.parent,
       title: translation ? translation.title : '',
       description: translation ? translation.description : '',
       translations: cat.translations,
       created_at: cat.created_at,
       updated_at: cat.updated_at,
     };
  }

  // Update category and its translations
  async update(id: string, updateDto: UpdateCourseCategoryDto): Promise<{ message: string; data: CourseCategory }> {
    const category = await this.findOne(id);

    // 1. Validate parent category
    if (updateDto.parent_id) {
      if (updateDto.parent_id === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parentExists = await this.categoryRepository.findOne({
        where: { id: updateDto.parent_id },
      });
      if (!parentExists) {
        throw new NotFoundException(trans('category.parent_not_found'));
      }
    }

    // 2. Update category core fields
    category.is_active = updateDto.is_active !== undefined ? updateDto.is_active : category.is_active;
    category.parent_id = updateDto.parent_id || null;

    const savedCategory = await this.categoryRepository.save(category);

    // 4. Delete existing translations that are not in the new payload, and upsert the rest
    const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
    const existingTranslations = await this.translationRepository.find({
      where: { course_category_id: id },
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
          course_category_id: id,
          language_id: lang.id,
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
      where: { parent_id: id },
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
