import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../databaseSchema/course.schema';
import { CourseTranslation } from '../databaseSchema/course-translation.schema';
import { CourseCategory } from '../databaseSchema/course-category.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { trans, localeStorage } from '../utils/trans';
import { CourseType, CourseLevel, CourseStatus } from '../utils/enums';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseTranslation)
    private readonly translationRepository: Repository<CourseTranslation>,
    @InjectRepository(CourseCategory)
    private readonly categoryRepository: Repository<CourseCategory>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  // Create a new course with translations
  async create(createDto: CreateCourseDto, userId: string): Promise<{ message: string; data: Course }> {

    const categoryExists = await this.categoryRepository.findOne({
      where: { id: createDto.category_id },
    });
    if (!categoryExists) {
      throw new NotFoundException(trans('course.category_not_found'));
    }

    const slugExists = await this.courseRepository.findOne({
      where: { slug: createDto.slug },
    });
    if (slugExists) {
      throw new ConflictException(trans('course.slug_exists'));
    }

    const course = this.courseRepository.create({
      category_id: createDto.category_id,
      type: createDto.type,
      level: createDto.level,
      slug: createDto.slug,
      thumbnail: createDto.thumbnail || null,
      image: createDto.image || null,
      language: createDto.language || null,
      topics: createDto.topics || null,
      status: createDto.status || CourseStatus.DRAFT,
      created_by: userId,
    });

    const savedCourse = await this.courseRepository.save(course);

    const translations: CourseTranslation[] = [];
    for (const tDto of createDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('course.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        course_id: savedCourse.id,
        language_id: lang.id,
        title: tDto.title,
        description: tDto.description || null,
        overview: tDto.overview || null,
      });

      translations.push(translation);
    }

    savedCourse.translations = await this.translationRepository.save(translations);

    return {
      message: trans('course.created'),
      data: savedCourse,
    };
  }

  // Get all courses, localized
  async findAll(): Promise<any[]> {
    const locale = localeStorage.getStore() || 'en';
    const courses = await this.courseRepository.find({
      relations: {
        translations: {
          language: true,
        },
        category: true,
      },
    });

    return courses.map((course) => {
      let translation = course.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = course.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && course.translations.length > 0) {
        translation = course.translations[0];
      }

      return {
        id: course.id,
        category_id: course.category_id,
        type: course.type,
        level: course.level,
        slug: course.slug,
        thumbnail: course.thumbnail,
        image: course.image,
        language: course.language,
        topics: course.topics,
        status: course.status,
        created_by: course.created_by,
        updated_by: course.updated_by,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        overview: translation ? translation.overview : '',
        category: course.category,
        created_at: course.created_at,
        updated_at: course.updated_at,
      };
    });
  }

  // Find course entity by ID helper
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
        category: true,
        creator: true,
        updater: true,
      },
    });

    if (!course) {
      throw new NotFoundException(trans('course.not_found'));
    }

    return course;
  }

  // Get course by ID, localized
  async findOneLocalized(id: string): Promise<any> {
    const course = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = course.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = course.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && course.translations.length > 0) {
      translation = course.translations[0];
    }

    return {
      id: course.id,
      category_id: course.category_id,
      type: course.type,
      level: course.level,
      slug: course.slug,
      thumbnail: course.thumbnail,
      image: course.image,
      language: course.language,
      topics: course.topics,
      status: course.status,
      created_by: course.created_by,
      updated_by: course.updated_by,
      title: translation ? translation.title : '',
      description: translation ? translation.description : '',
      overview: translation ? translation.overview : '',
      category: course.category,
      translations: course.translations,
      created_at: course.created_at,
      updated_at: course.updated_at,
    };
  }

  // Update course and its translations
  async update(id: string, updateDto: UpdateCourseDto, userId: string): Promise<{ message: string; data: Course }> {
    const course = await this.findOne(id);

    // Verify category exists if updated
    if (updateDto.category_id) {
      const categoryExists = await this.categoryRepository.findOne({
        where: { id: updateDto.category_id },
      });
      if (!categoryExists) {
        throw new NotFoundException(trans('course.category_not_found'));
      }
      course.category_id = updateDto.category_id;
    }

    // Verify slug unique if updated
    if (updateDto.slug && updateDto.slug !== course.slug) {
      const slugExists = await this.courseRepository.findOne({
        where: { slug: updateDto.slug },
      });
      if (slugExists) {
        throw new ConflictException(trans('course.slug_exists'));
      }
      course.slug = updateDto.slug;
    }

    // Update core fields
    if (updateDto.type !== undefined) course.type = updateDto.type;
    if (updateDto.level !== undefined) course.level = updateDto.level;
    if (updateDto.thumbnail !== undefined) course.thumbnail = updateDto.thumbnail;
    if (updateDto.image !== undefined) course.image = updateDto.image;
    if (updateDto.language !== undefined) course.language = updateDto.language;
    if (updateDto.topics !== undefined) course.topics = updateDto.topics;
    if (updateDto.status !== undefined) course.status = updateDto.status;
    course.updated_by = userId;

    const savedCourse = await this.courseRepository.save(course);

    // Update translations if provided
    if (updateDto.translations) {
      const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { course_id: id },
        relations: { language: true },
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
          throw new NotFoundException(trans('course.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.title = tDto.title;
          existingT.description = tDto.description || null;
          existingT.overview = tDto.overview || null;
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            course_id: id,
            language_id: lang.id,
            title: tDto.title,
            description: tDto.description || null,
            overview: tDto.overview || null,
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    // Reload with relations
    const updatedCourse = await this.findOne(id);

    return {
      message: trans('course.updated'),
      data: updatedCourse,
    };
  }

  // Delete a course
  async remove(id: string): Promise<{ message: string }> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);

    return {
      message: trans('course.deleted'),
    };
  }
}
