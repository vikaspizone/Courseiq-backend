import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../databaseSchema/lesson.schema';
import { LessonTranslation } from '../databaseSchema/lesson-translation.schema';
import { CourseSection } from '../databaseSchema/course-section.schema';
import { Course } from '../databaseSchema/course.schema';
import { Language } from '../databaseSchema/language.schema';
import { CourseMedia } from '../databaseSchema/course-media.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonTranslation)
    private readonly translationRepository: Repository<LessonTranslation>,
    @InjectRepository(CourseSection)
    private readonly sectionRepository: Repository<CourseSection>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(CourseMedia)
    private readonly courseMediaRepository: Repository<CourseMedia>,
  ) {}

  // Create a new lesson with translations and media
  async create(createDto: CreateLessonDto, userId: string): Promise<{ message: string; data: any }> {
    const courseExists = await this.courseRepository.findOne({
      where: { id: createDto.course_id },
    });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    const sectionExists = await this.sectionRepository.findOne({
      where: { id: createDto.section_id },
    });
    if (!sectionExists) {
      throw new NotFoundException(trans('section.not_found'));
    }

    if (sectionExists.course_id !== createDto.course_id) {
      throw new BadRequestException('The specified section does not belong to the specified course.');
    }

    let sortOrder = createDto.sort_order;
    if (sortOrder === undefined) {
      const maxLesson = await this.lessonRepository.findOne({
        where: { section_id: createDto.section_id },
        order: { sort_order: 'DESC' },
      });
      sortOrder = maxLesson ? Number(maxLesson.sort_order) + 1 : 1;
    }

    const lesson = this.lessonRepository.create({
      course_id: createDto.course_id,
      section_id: createDto.section_id,
      type: createDto.type,
      duration: createDto.duration || 0,
      sort_order: sortOrder,
      is_preview: createDto.is_preview !== undefined ? createDto.is_preview : false,
      is_active: createDto.is_active !== undefined ? createDto.is_active : true,
      created_by: userId,
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    // Save translations
    const translations: LessonTranslation[] = [];
    for (const tDto of createDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('lesson.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        lesson_id: savedLesson.id,
        language_id: lang.id,
        title: tDto.title,
        description: tDto.description || null,
        content: tDto.content || null,
      });

      translations.push(translation);
    }

    savedLesson.translations = await this.translationRepository.save(translations);

    // Save multiple media in CourseMedia table
    const processedMedia = (createDto as any).processedMedia || [];
    if (processedMedia && processedMedia.length > 0) {
      for (const mediaItem of processedMedia) {
        const itemMedia = this.courseMediaRepository.create({
          course_id: savedLesson.course_id,
          lesson_id: savedLesson.id,
          type: mediaItem.type,
          file_name: mediaItem.file_name || null,
          file_path: mediaItem.file_path || null,
          file_url: mediaItem.file_url,
          mime_type: mediaItem.mime_type || null,
          file_size: mediaItem.file_size || null,
          is_active: true,
          is_thumbnail: mediaItem.is_thumbnail || false,
          is_url: mediaItem.is_url || false,
          sort_order: mediaItem.sort_order || 0,
          created_by: userId,
        });
        await this.courseMediaRepository.save(itemMedia);
      }
    }

    const reloaded = await this.findOneLocalized(savedLesson.id);

    return {
      message: trans('lesson.created'),
      data: reloaded,
    };
  }

  // Get all lessons, filterable and localized
  async findAll(options: { page?: number; limit?: number; search?: string; course_id?: string; section_id?: string; type?: any }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.lessonRepository.createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('lesson.media', 'media')
      .orderBy('lesson.sort_order', 'ASC');

    if (options.course_id) {
      queryBuilder.andWhere('lesson.course_id = :course_id', { course_id: options.course_id });
    }

    if (options.section_id) {
      queryBuilder.andWhere('lesson.section_id = :section_id', { section_id: options.section_id });
    }

    if (options.type) {
      queryBuilder.andWhere('lesson.type = :type', { type: options.type });
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
    const mappedItems = items.map((les) => {
      let translation = les.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = les.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && les.translations.length > 0) {
        translation = les.translations[0];
      }

      return {
        id: les.id,
        course_id: les.course_id,
        section_id: les.section_id,
        type: les.type,
        duration: les.duration,
        sort_order: les.sort_order,
        is_preview: les.is_preview,
        is_active: les.is_active,
        created_by: les.created_by,
        updated_by: les.updated_by,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        content: translation ? translation.content : '',
        media: les.media || [],
        created_at: les.created_at,
        updated_at: les.updated_at,
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

  // Find lesson by ID helper
  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
        media: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException(trans('lesson.not_found'));
    }

    return lesson;
  }

  // Get localized single lesson by ID
  async findOneLocalized(id: string): Promise<any> {
    const les = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = les.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = les.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && les.translations.length > 0) {
      translation = les.translations[0];
    }

    return {
      id: les.id,
      course_id: les.course_id,
      section_id: les.section_id,
      type: les.type,
      duration: les.duration,
      sort_order: les.sort_order,
      is_preview: les.is_preview,
      is_active: les.is_active,
      created_by: les.created_by,
      updated_by: les.updated_by,
      title: translation ? translation.title : '',
      description: translation ? translation.description : '',
      content: translation ? translation.content : '',
      media: les.media || [],
      translations: les.translations.map((t) => ({
        id: t.id,
        languageCode: t.language.code,
        title: t.title,
        description: t.description,
        content: t.content,
      })),
      created_at: les.created_at,
      updated_at: les.updated_at,
    };
  }

  // Update lesson and translations and media
  async update(id: string, updateDto: UpdateLessonDto, userId: string): Promise<{ message: string; data: any }> {
    const lesson = await this.findOne(id);

    if (updateDto.course_id) {
      const courseExists = await this.courseRepository.findOne({
        where: { id: updateDto.course_id },
      });
      if (!courseExists) {
        throw new NotFoundException(trans('course.not_found'));
      }
      lesson.course_id = updateDto.course_id;
    }

    if (updateDto.section_id) {
      const sectionExists = await this.sectionRepository.findOne({
        where: { id: updateDto.section_id },
      });
      if (!sectionExists) {
        throw new NotFoundException(trans('section.not_found'));
      }
      lesson.section_id = updateDto.section_id;
    }

    // If both are updated or only one, check compatibility
    const finalCourseId = updateDto.course_id || lesson.course_id;
    const finalSectionId = updateDto.section_id || lesson.section_id;
    const sec = await this.sectionRepository.findOne({ where: { id: finalSectionId } });
    if (sec && sec.course_id !== finalCourseId) {
      throw new BadRequestException('The section does not belong to the specified course.');
    }

    if (updateDto.type !== undefined) lesson.type = updateDto.type;
    if (updateDto.duration !== undefined) lesson.duration = updateDto.duration;
    if (updateDto.sort_order !== undefined) lesson.sort_order = updateDto.sort_order;
    if (updateDto.is_preview !== undefined) lesson.is_preview = updateDto.is_preview;
    if (updateDto.is_active !== undefined) lesson.is_active = updateDto.is_active;

    lesson.updated_by = userId;

    await this.lessonRepository.save(lesson);

    // Update translations
    if (updateDto.translations) {
      const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { lesson_id: id },
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
          throw new NotFoundException(trans('lesson.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.title = tDto.title;
          existingT.description = tDto.description || null;
          existingT.content = tDto.content || null;
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            lesson_id: id,
            language_id: lang.id,
            title: tDto.title,
            description: tDto.description || null,
            content: tDto.content || null,
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    // Save multiple media in CourseMedia table
    const processedMedia = (updateDto as any).processedMedia;
    if (processedMedia && processedMedia.length > 0) {
      const hasNewThumbnail = processedMedia.some(item => item.is_thumbnail === true || (item.is_thumbnail as any) === 'true');
      if (hasNewThumbnail) {
        await this.courseMediaRepository.update(
          { lesson_id: id, is_thumbnail: true },
          { is_thumbnail: false },
        );
      }

      for (const mediaItem of processedMedia) {
        const itemMedia = this.courseMediaRepository.create({
          course_id: lesson.course_id,
          lesson_id: lesson.id,
          type: mediaItem.type,
          file_name: mediaItem.file_name || null,
          file_path: mediaItem.file_path || null,
          file_url: mediaItem.file_url,
          mime_type: mediaItem.mime_type || null,
          file_size: mediaItem.file_size || null,
          is_active: true,
          is_thumbnail: mediaItem.is_thumbnail || false,
          is_url: mediaItem.is_url || false,
          sort_order: mediaItem.sort_order || 0,
          created_by: userId,
        });
        await this.courseMediaRepository.save(itemMedia);
      }
    }

    const reloaded = await this.findOneLocalized(id);

    return {
      message: trans('lesson.updated'),
      data: reloaded,
    };
  }

  // Delete lesson
  async remove(id: string): Promise<{ message: string }> {
    const lesson = await this.findOne(id);
    await this.lessonRepository.remove(lesson);
    return {
      message: trans('lesson.deleted'),
    };
  }
}
