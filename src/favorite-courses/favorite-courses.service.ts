import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteCourse } from '../databaseSchema/favorite-course.schema';
import { Course } from '../databaseSchema/course.schema';
import { trans } from '../utils/trans';

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
          translations: true,
        },
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }
}
