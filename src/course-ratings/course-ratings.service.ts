import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRating } from '../databaseSchema/course-rating.schema';
import { Course } from '../databaseSchema/course.schema';
import { CourseRatingTranslation } from '../databaseSchema/course-rating-translation.schema';
import { Language } from '../databaseSchema/language.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class CourseRatingsService {
  constructor(
    @InjectRepository(CourseRating)
    private readonly ratingRepository: Repository<CourseRating>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseRatingTranslation)
    private readonly translationRepository: Repository<CourseRatingTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async createOrUpdate(createDto: CreateRatingDto, userId: string): Promise<{ message: string; data: any }> {
    const courseExists = await this.courseRepository.findOne({ where: { id: createDto.course_id } });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    const locale = localeStorage.getStore() || 'en';
    const lang = await this.languageRepository.findOne({ where: { code: locale } });
    if (!lang) {
      throw new NotFoundException(trans('course.lang_not_found', { code: locale }));
    }

    let rating = await this.ratingRepository.findOne({
      where: { course_id: createDto.course_id, user_id: userId },
      relations: { translations: true },
    });

    let message = trans('rating.created');
    if (rating) {
      rating.rating = createDto.rating;
      message = trans('rating.updated');
    } else {
      rating = this.ratingRepository.create({
        course_id: createDto.course_id,
        user_id: userId,
        rating: createDto.rating,
      });
    }

    const saved = await this.ratingRepository.save(rating);

    if (createDto.translations && createDto.translations.length > 0) {
      for (const tDto of createDto.translations) {
        const tLang = await this.languageRepository.findOne({
          where: { code: tDto.languageCode },
        });
        if (tLang) {
          let translation = rating.translations?.find((t) => t.language_id === tLang.id);
          if (translation) {
            translation.review = tDto.review;
            await this.translationRepository.save(translation);
          } else {
            const newTranslation = this.translationRepository.create({
              course_rating_id: saved.id,
              language_id: tLang.id,
              review: tDto.review,
            });
            await this.translationRepository.save(newTranslation);
          }
        }
      }
    }

    const reloaded = await this.ratingRepository.findOne({
      where: { id: saved.id },
      relations: { translations: { language: true } },
    });

    let reloadedTranslation = reloaded?.translations?.find((t) => t.language.code === locale);
    if (!reloadedTranslation && locale !== 'en') {
      reloadedTranslation = reloaded?.translations?.find((t) => t.language.code === 'en');
    }
    if (!reloadedTranslation && reloaded?.translations && reloaded.translations.length > 0) {
      reloadedTranslation = reloaded.translations[0];
    }

    const mappedData = reloaded ? {
      id: reloaded.id,
      course_id: reloaded.course_id,
      user_id: reloaded.user_id,
      rating: reloaded.rating,
      review: reloadedTranslation ? reloadedTranslation.review : '',
      created_at: reloaded.created_at,
      updated_at: reloaded.updated_at,
    } : null;

    return {
      message,
      data: mappedData,
    };
  }

  async getRatings(options: { page?: number; limit?: number }): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.ratingRepository.findAndCount({
      relations: {
        user: true,
        course: {
          translations: {
            language: true,
          },
        },
        translations: {
          language: true,
        },
      },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((rating) => {
      let translation = rating.translations?.find((t) => t.language.code === locale);
      if (!translation && locale !== 'en') {
        translation = rating.translations?.find((t) => t.language.code === 'en');
      }
      if (!translation && rating.translations && rating.translations.length > 0) {
        translation = rating.translations[0];
      }

      const userData = rating.user ? {
        id: rating.user.id,
        name: rating.user.name,
        email: rating.user.email,
        phone: rating.user.phone,
      } : null;

      const course = rating.course;
      let localizedCourse: any = null;
      if (course) {
        let courseTranslation = course.translations?.find((t) => t.language.code === locale);
        if (!courseTranslation && locale !== 'en') {
          courseTranslation = course.translations?.find((t) => t.language.code === 'en');
        }
        if (!courseTranslation && course.translations && course.translations.length > 0) {
          courseTranslation = course.translations[0];
        }

        localizedCourse = {
          id: course.id,
          category_id: course.category_id,
          type: course.type,
          level: course.level,
          slug: course.slug,
          title: courseTranslation ? courseTranslation.title : '',
          description: courseTranslation ? courseTranslation.description : '',
        };
      }

      return {
        id: rating.id,
        course_id: rating.course_id,
        user_id: rating.user_id,
        rating: rating.rating,
        review: translation ? translation.review : '',
        user: userData,
        course: localizedCourse,
        created_at: rating.created_at,
        updated_at: rating.updated_at,
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

  async getRatingsByCourse(courseId: string): Promise<any[]> {
    const courseExists = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    const locale = localeStorage.getStore() || 'en';

    const ratings = await this.ratingRepository.find({
      where: { course_id: courseId },
      relations: {
        user: true,
        course: {
          translations: {
            language: true,
          },
        },
        translations: {
          language: true,
        },
      },
      order: { created_at: 'DESC' },
    });

    return ratings.map((rating) => {
      let translation = rating.translations?.find((t) => t.language.code === locale);
      if (!translation && locale !== 'en') {
        translation = rating.translations?.find((t) => t.language.code === 'en');
      }
      if (!translation && rating.translations && rating.translations.length > 0) {
        translation = rating.translations[0];
      }

      const userData = rating.user ? {
        id: rating.user.id,
        name: rating.user.name,
        email: rating.user.email,
        phone: rating.user.phone,
      } : null;

      const course = rating.course;
      let localizedCourse: any = null;
      if (course) {
        let courseTranslation = course.translations?.find((t) => t.language.code === locale);
        if (!courseTranslation && locale !== 'en') {
          courseTranslation = course.translations?.find((t) => t.language.code === 'en');
        }
        if (!courseTranslation && course.translations && course.translations.length > 0) {
          courseTranslation = course.translations[0];
        }

        localizedCourse = {
          id: course.id,
          category_id: course.category_id,
          type: course.type,
          level: course.level,
          slug: course.slug,
          title: courseTranslation ? courseTranslation.title : '',
          description: courseTranslation ? courseTranslation.description : '',
        };
      }

      return {
        id: rating.id,
        course_id: rating.course_id,
        user_id: rating.user_id,
        rating: rating.rating,
        review: translation ? translation.review : '',
        user: userData,
        course: localizedCourse,
        created_at: rating.created_at,
        updated_at: rating.updated_at,
      };
    });
  }

  async removeRating(id: string, userId: string, userRole: string): Promise<{ message: string }> {
    const rating = await this.ratingRepository.findOne({ where: { id } });
    if (!rating) {
      throw new NotFoundException(trans('rating.not_found'));
    }

    if (rating.user_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException(trans('rating.unauthorized_delete'));
    }

    await this.ratingRepository.remove(rating);
    return {
      message: trans('rating.deleted'),
    };
  }
}
