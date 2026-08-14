import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseInstructor } from '../databaseSchema/course-instructor.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';
import { CreateCourseInstructorDto } from './dto/create-course-instructor.dto';
import { UpdateCourseInstructorDto } from './dto/update-course-instructor.dto';
import { CourseInstructorFilterDto } from './dto/course-instructor-filter.dto';
import { trans } from '../utils/trans';

@Injectable()
export class CourseInstructorsService {
  constructor(
    @InjectRepository(CourseInstructor)
    private readonly courseInstructorRepository: Repository<CourseInstructor>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async assign(createDto: CreateCourseInstructorDto, userId: string): Promise<CourseInstructor> {
    const courseExists = await this.courseRepository.findOne({ where: { id: createDto.course_id } });
    if (!courseExists) {
      throw new NotFoundException(trans('course.not_found'));
    }

    const instructorExists = await this.userRepository.findOne({ where: { id: createDto.instructor_id } });
    if (!instructorExists) {
      throw new NotFoundException(trans('course_instructor.instructor_not_found'));
    }

    const alreadyAssigned = await this.courseInstructorRepository.findOne({
      where: { course_id: createDto.course_id, instructor_id: createDto.instructor_id },
    });
    if (alreadyAssigned) {
      throw new BadRequestException(trans('course_instructor.already_assigned'));
    }

    if (createDto.is_primary) {
      const primaryExists = await this.courseInstructorRepository.findOne({
        where: { course_id: createDto.course_id, is_primary: true },
      });
      if (primaryExists) {
        throw new BadRequestException(trans('course_instructor.primary_exists'));
      }
    }

    const mapping = this.courseInstructorRepository.create({
      course_id: createDto.course_id,
      instructor_id: createDto.instructor_id,
      is_primary: createDto.is_primary ?? false,
      is_active: createDto.is_active ?? true,
      created_by: userId,
    });

    return await this.courseInstructorRepository.save(mapping);
  }

  async getAll(filterDto: CourseInstructorFilterDto): Promise<any> {
    const page = Math.max(1, Number(filterDto.page || 1));
    const limit = Math.max(1, Number(filterDto.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.courseInstructorRepository.createQueryBuilder('ci')
      .leftJoinAndSelect('ci.course', 'course')
      .leftJoinAndSelect('ci.instructor', 'instructor')
      .leftJoinAndSelect('ci.creator', 'creator')
      .leftJoinAndSelect('ci.updater', 'updater');

    if (filterDto.course_id) {
      queryBuilder.andWhere('ci.course_id = :courseId', { courseId: filterDto.course_id });
    }

    if (filterDto.instructor_id) {
      queryBuilder.andWhere('ci.instructor_id = :instructorId', { instructorId: filterDto.instructor_id });
    }

    if (filterDto.is_primary !== undefined) {
      queryBuilder.andWhere('ci.is_primary = :isPrimary', { isPrimary: filterDto.is_primary });
    }

    if (filterDto.is_active !== undefined) {
      queryBuilder.andWhere('ci.is_active = :isActive', { isActive: filterDto.is_active });
    }

    queryBuilder
      .orderBy('ci.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();
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

  async getById(id: string): Promise<CourseInstructor> {
    const mapping = await this.courseInstructorRepository.findOne({
      where: { id },
      relations: { course: true, instructor: true, creator: true, updater: true },
    });
    if (!mapping) {
      throw new NotFoundException(trans('course_instructor.not_found'));
    }
    return mapping;
  }

  async update(id: string, updateDto: UpdateCourseInstructorDto, userId: string): Promise<CourseInstructor> {
    const mapping = await this.getById(id);

    const targetCourseId = updateDto.course_id ?? mapping.course_id;
    const targetInstructorId = updateDto.instructor_id ?? mapping.instructor_id;

    if (updateDto.course_id && updateDto.course_id !== mapping.course_id) {
      const courseExists = await this.courseRepository.findOne({ where: { id: updateDto.course_id } });
      if (!courseExists) {
        throw new NotFoundException(trans('course.not_found'));
      }
    }

    if (updateDto.instructor_id && updateDto.instructor_id !== mapping.instructor_id) {
      const instructorExists = await this.userRepository.findOne({ where: { id: updateDto.instructor_id } });
      if (!instructorExists) {
        throw new NotFoundException(trans('course_instructor.instructor_not_found'));
      }
    }

    if (
      (updateDto.course_id && updateDto.course_id !== mapping.course_id) ||
      (updateDto.instructor_id && updateDto.instructor_id !== mapping.instructor_id)
    ) {
      const alreadyAssigned = await this.courseInstructorRepository.findOne({
        where: { course_id: targetCourseId, instructor_id: targetInstructorId },
      });
      if (alreadyAssigned && alreadyAssigned.id !== id) {
        throw new BadRequestException(trans('course_instructor.already_assigned'));
      }
    }

    if (updateDto.is_primary) {
      const primaryExists = await this.courseInstructorRepository.findOne({
        where: { course_id: targetCourseId, is_primary: true },
      });
      if (primaryExists && primaryExists.id !== id) {
        throw new BadRequestException(trans('course_instructor.primary_exists'));
      }
    }

    if (updateDto.course_id !== undefined) mapping.course_id = updateDto.course_id;
    if (updateDto.instructor_id !== undefined) mapping.instructor_id = updateDto.instructor_id;
    if (updateDto.is_primary !== undefined) mapping.is_primary = updateDto.is_primary;
    if (updateDto.is_active !== undefined) mapping.is_active = updateDto.is_active;

    mapping.updated_by = userId;

    return await this.courseInstructorRepository.save(mapping);
  }

  async delete(id: string): Promise<{ message: string }> {
    const mapping = await this.courseInstructorRepository.findOne({ where: { id } });
    if (!mapping) {
      throw new NotFoundException(trans('course_instructor.not_found'));
    }

    await this.courseInstructorRepository.remove(mapping);
    return {
      message: trans('course_instructor.deleted'),
    };
  }
}
