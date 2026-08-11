import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteCourse } from '../databaseSchema/favorite-course.schema';
import { Course } from '../databaseSchema/course.schema';
import { trans, localeStorage } from '../utils/trans';

@Injectable()
export class FavoriteCoursesService {
  constructor(
    @InjectRepository(FavoriteCourse)
    private readonly favoriteCourseRepository: Repository<FavoriteCourse>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async addFavorite(courseId: string, userId: string): Promise<{ message: string; data: FavoriteCourse }> {
    const courseExists = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    const alreadyExists = await this.favoriteCourseRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });
    if (alreadyExists) {
      throw new ConflictException(trans('favorite.already_exists'));
    }

    const favorite = this.favoriteCourseRepository.create({
      course_id: courseId,
      user_id: userId,
    });

    const saved = await this.favoriteCourseRepository.save(favorite);
    return {
      message: trans('favorite.added'),
      data: saved,
    };
  }

  async removeFavorite(courseId: string, userId: string): Promise<{ message: string }> {
    const favorite = await this.favoriteCourseRepository.findOne({
      where: { course_id: courseId, user_id: userId },
    });
    if (!favorite) {
      throw new NotFoundException(trans('favorite.not_found'));
    }

    await this.favoriteCourseRepository.remove(favorite);
    return {
      message: trans('favorite.removed'),
    };
  }

  async getFavorites(options: { page?: number; limit?: number }, userId: string): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.favoriteCourseRepository.findAndCount({
      where: { user_id: userId },
      relations: {
        course: {
          translations: {
            language: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((fav) => {
      const course = fav.course;
      if (!course) {
        return fav;
      }

      let translation = course.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = course.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && course.translations.length > 0) {
        translation = course.translations[0];
      }

      const localizedCourse = {
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
        created_at: course.created_at,
        updated_at: course.updated_at,
      };

      return {
        id: fav.id,
        user_id: fav.user_id,
        course_id: fav.course_id,
        created_at: fav.created_at,
        course: localizedCourse,
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
}
