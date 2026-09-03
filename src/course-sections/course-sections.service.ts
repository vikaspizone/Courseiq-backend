import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSection } from '../databaseSchema/course-section.schema';
import { CourseSectionTranslation } from '../databaseSchema/course-section-translation.schema';
import { Course } from '../databaseSchema/course.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class CourseSectionsService {
  constructor(
    @InjectRepository(CourseSection)
    private readonly sectionRepository: Repository<CourseSection>,
    @InjectRepository(CourseSectionTranslation)
    private readonly translationRepository: Repository<CourseSectionTranslation>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  // Create a new section with translations
  async create(createDto: CreateCourseSectionDto, userId: string): Promise<{ message: string; data: any }> {
    const courseExists = await this.courseRepository.findOne({
      where: { id: createDto.course_id },
    });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    let sortOrder = createDto.sort_order;
    if (sortOrder === undefined) {
      const maxSection = await this.sectionRepository.findOne({
        where: { course_id: createDto.course_id },
        order: { sort_order: 'DESC' },
      });
      sortOrder = maxSection ? Number(maxSection.sort_order) + 1 : 1;
    }

    const section = this.sectionRepository.create({
      course_id: createDto.course_id,
      sort_order: sortOrder,
      is_active: createDto.is_active !== undefined ? createDto.is_active : true,
      created_by: userId,
    });

    const savedSection = await this.sectionRepository.save(section);

    const translations: CourseSectionTranslation[] = [];
    for (const tDto of createDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('section.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        section_id: savedSection.id,
        language_id: lang.id,
        title: tDto.title,
        description: tDto.description || null,
      });

      translations.push(translation);
    }

    savedSection.translations = await this.translationRepository.save(translations);

    const reloaded = await this.findOneLocalized(savedSection.id);

    return {
      message: trans('section.created'),
      data: reloaded,
    };
  }

  // Get all sections, filterable and localized
  async findAll(options: { page?: number; limit?: number; search?: string; course_id?: string }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.sectionRepository.createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .orderBy('section.sort_order', 'ASC');

    if (options.course_id) {
      queryBuilder.andWhere('section.course_id = :course_id', { course_id: options.course_id });
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(LOWER(translation.title) LIKE LOWER(:search) OR LOWER(translation.description) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    const [items, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((sec) => {
      let translation = sec.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = sec.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && sec.translations.length > 0) {
        translation = sec.translations[0];
      }

      return {
        id: sec.id,
        course_id: sec.course_id,
        sort_order: sec.sort_order,
        is_active: sec.is_active,
        created_by: sec.created_by,
        updated_by: sec.updated_by,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        created_at: sec.created_at,
        updated_at: sec.updated_at,
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

  // Find section by ID helper
  async findOne(id: string): Promise<CourseSection> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
      },
    });

    if (!section) {
      throw new NotFoundException(trans('section.not_found'));
    }

    return section;
  }

  // Get localized single section by ID
  async findOneLocalized(id: string): Promise<any> {
    const sec = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = sec.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = sec.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && sec.translations.length > 0) {
      translation = sec.translations[0];
    }

    return {
      id: sec.id,
      course_id: sec.course_id,
      sort_order: sec.sort_order,
      is_active: sec.is_active,
      created_by: sec.created_by,
      updated_by: sec.updated_by,
      title: translation ? translation.title : '',
      description: translation ? translation.description : '',
      translations: sec.translations.map((t) => ({
        id: t.id,
        languageCode: t.language.code,
        title: t.title,
        description: t.description,
      })),
      created_at: sec.created_at,
      updated_at: sec.updated_at,
    };
  }

  // Update section and translations
  async update(id: string, updateDto: UpdateCourseSectionDto, userId: string): Promise<{ message: string; data: any }> {
    const section = await this.findOne(id);

    if (updateDto.course_id) {
      const courseExists = await this.courseRepository.findOne({
        where: { id: updateDto.course_id },
      });
      if (!courseExists) {
        throw new NotFoundException(trans('course.not_found'));
      }
      section.course_id = updateDto.course_id;
    }

    if (updateDto.sort_order !== undefined) {
      section.sort_order = updateDto.sort_order;
    }

    if (updateDto.is_active !== undefined) {
      section.is_active = updateDto.is_active;
    }

    section.updated_by = userId;

    await this.sectionRepository.save(section);

    if (updateDto.translations) {
      const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { section_id: id },
        relations: { language: true },
      });

      // Remove translations not in update payload
      for (const extT of existingTranslations) {
        if (!payloadLangCodes.includes(extT.language.code)) {
          await this.translationRepository.remove(extT);
        }
      }

      // Upsert translations
      for (const tDto of updateDto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { code: tDto.languageCode },
        });

        if (!lang) {
          throw new NotFoundException(trans('section.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.title = tDto.title;
          existingT.description = tDto.description || null;
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            section_id: id,
            language_id: lang.id,
            title: tDto.title,
            description: tDto.description || null,
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    const reloaded = await this.findOneLocalized(id);

    return {
      message: trans('section.updated'),
      data: reloaded,
    };
  }

  // Delete section
  async remove(id: string): Promise<{ message: string }> {
    const section = await this.findOne(id);
    await this.sectionRepository.remove(section);
    return {
      message: trans('section.deleted'),
    };
  }
}
