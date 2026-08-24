import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseMedia } from '../databaseSchema/course-media.schema';
import { Course } from '../databaseSchema/course.schema';
import { UpdateCourseMediaDto } from './dto/update-course-media.dto';
import { trans, localeStorage } from '../utils/trans';
import { CourseMediaType } from '../utils/enums';

export interface CreateMediaPayload {
  course_id: string;
  type: CourseMediaType;
  file_name?: string | null;
  file_path?: string | null;
  file_url: string;
  mime_type?: string | null;
  file_size?: string | null;
  is_active?: boolean;
  is_thumbnail?: boolean;
  is_url?: boolean;
}

@Injectable()
export class CourseMediaService {
  constructor(
    @InjectRepository(CourseMedia)
    private readonly courseMediaRepository: Repository<CourseMedia>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Adds a new course media item.
   */
  async add(dto: CreateMediaPayload, userId: string): Promise<CourseMedia> {
    const courseExists = await this.courseRepository.findOne({ where: { id: dto.course_id } });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    // If this media is marked as thumbnail, reset all other thumbnails for this course
    if (dto.is_thumbnail === true) {
      await this.courseMediaRepository.update(
        { course_id: dto.course_id, is_thumbnail: true },
        { is_thumbnail: false },
      );
    }

    // Find the current max sort order for this course_id and type
    const maxMedia = await this.courseMediaRepository.findOne({
      where: { course_id: dto.course_id, type: dto.type },
      order: { sort_order: 'DESC' },
    });
    const nextSortOrder = maxMedia ? Number(maxMedia.sort_order) + 1 : 1;

    const media = this.courseMediaRepository.create({
      ...dto,
      sort_order: nextSortOrder,
      created_by: userId,
    });

    return await this.courseMediaRepository.save(media);
  }

  /**
   * Updates an existing course media item.
   */
  async update(id: string, dto: UpdateCourseMediaDto, userId: string): Promise<CourseMedia> {
    const media = await this.courseMediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(trans('media.not_found'));
    }

    // If course_id is provided, verify that the new course exists
    const targetCourseId = dto.course_id || media.course_id;
    if (dto.course_id && dto.course_id !== media.course_id) {
      const courseExists = await this.courseRepository.findOne({ where: { id: dto.course_id } });
      if (!courseExists) {
        throw new NotFoundException(trans('course.not_found') || 'Course not found');
      }
    }

    // If this media is marked as thumbnail, reset all other thumbnails for this course
    if (dto.is_thumbnail === true) {
      await this.courseMediaRepository.update(
        { course_id: targetCourseId, is_thumbnail: true },
        { is_thumbnail: false },
      );
    }

    Object.assign(media, {
      ...dto,
      updated_by: userId,
    });

    return await this.courseMediaRepository.save(media);
  }

  /**
   * Deletes a course media item and re-indexes the remaining ones.
   */
  async delete(id: string): Promise<{ message: string }> {
    const media = await this.courseMediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(trans('media.not_found'));
    }

    const { course_id, type } = media;

    await this.courseMediaRepository.remove(media);

    // Fetch and re-index the remaining media of the same course and type
    const remainingMedia = await this.courseMediaRepository.find({
      where: { course_id, type },
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    for (let i = 0; i < remainingMedia.length; i++) {
      remainingMedia[i].sort_order = i + 1;
    }

    if (remainingMedia.length > 0) {
      await this.courseMediaRepository.save(remainingMedia);
    }

    return {
      message: trans('media.deleted'),
    };
  }

  /**
   * Retrieves all media associated with a course ID with pagination.
   */
  async getMediaByCourseId(courseId: string, query: { page?: number; limit?: number; isActiveOnly?: boolean }): Promise<any> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const whereCondition: any = { course_id: courseId };
    
    if (query.isActiveOnly !== undefined) {
      whereCondition.is_active = query.isActiveOnly;
    }

    const [items, totalItems] = await this.courseMediaRepository.findAndCount({
      where: whereCondition,
      order: {
        sort_order: 'ASC',
        created_at: 'DESC',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Retrieves a single course media item by ID.
   */
  async getById(id: string): Promise<CourseMedia> {
    const media = await this.courseMediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(trans('media.not_found'));
    }
    return media;
  }

  /**
   * Retrieves all course media items (across all courses) with pagination and optional filtering.
   */
  async getAllMedia(query: { page?: number; limit?: number; isActiveOnly?: boolean }): Promise<any> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (query.isActiveOnly !== undefined) {
      whereCondition.is_active = query.isActiveOnly;
    }

    const [items, totalItems] = await this.courseMediaRepository.findAndCount({
      where: whereCondition,
      relations: {
        course: {
          translations: {
            language: true,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
      skip,
      take: limit,
    });

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((mediaItem) => {
      const course = mediaItem.course;
      if (!course) {
        return mediaItem;
      }

      let translation = course.translations?.find((t) => t.language?.code === locale);
      if (!translation && locale !== 'en') {
        translation = course.translations?.find((t) => t.language?.code === 'en');
      }
      if (!translation && course.translations?.length > 0) {
        translation = course.translations[0];
      }

      const localizedCourse = {
        id: course.id,
        category_id: course.category_id,
        type: course.type,
        level: course.level,
        slug: course.slug,
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

      const { course: _, ...restOfMedia } = mediaItem;
      return {
        ...restOfMedia,
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
