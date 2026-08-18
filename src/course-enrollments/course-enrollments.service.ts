import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from '../databaseSchema/course-enrollment.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';
import { CourseEnrollmentFilterDto } from './dto/course-enrollment-filter.dto';
import { trans } from '../utils/trans';

@Injectable()
export class CourseEnrollmentsService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCourseEnrollmentDto, currentUserId: string, currentUserRole: string): Promise<CourseEnrollment> {
    const course = await this.courseRepository.findOne({ where: { id: dto.course_id } });
    if (!course) {
      throw new NotFoundException(trans('course.not_found') || 'Course not found');
    }

    // Determine target student ID
    const studentId = currentUserRole === 'admin' && dto.student_id ? dto.student_id : currentUserId;

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(trans('user.not_found') || 'Student user not found');
    }

    // Check if student is already enrolled in the course
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { course_id: dto.course_id, student_id: studentId },
    });
    if (existingEnrollment) {
      throw new ConflictException(trans('enrollment.already_enrolled'));
    }

    const enrollment = this.enrollmentRepository.create({
      course_id: dto.course_id,
      student_id: studentId,
      purchase_id: dto.purchase_id || null,
      status: dto.status,
      progress: dto.progress || 0,
      expires_at: dto.expires_at || null,
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(query: CourseEnrollmentFilterDto): Promise<any> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (query.course_id) {
      whereCondition.course_id = query.course_id;
    }
    if (query.student_id) {
      whereCondition.student_id = query.student_id;
    }
    if (query.status) {
      whereCondition.status = query.status;
    }

    const [items, totalItems] = await this.enrollmentRepository.findAndCount({
      where: whereCondition,
      relations: { course: true, student: true, purchase: true },
      order: {
        enrolled_at: 'DESC',
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

  async findOne(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: { course: true, student: true, purchase: true },
    });
    if (!enrollment) {
      throw new NotFoundException(trans('enrollment.not_found'));
    }
    return enrollment;
  }

  async update(id: string, dto: UpdateCourseEnrollmentDto): Promise<CourseEnrollment> {
    const enrollment = await this.findOne(id);

    Object.assign(enrollment, dto);

    // If progress reaches 100%, automatically set completed_at and completed status if not already set
    if (dto.progress !== undefined && Number(dto.progress) >= 100) {
      enrollment.completed_at = enrollment.completed_at || new Date();
    }

    return await this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string): Promise<{ message: string }> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
    return { message: trans('enrollment.deleted') };
  }
}
