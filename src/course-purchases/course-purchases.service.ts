import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursePurchase } from '../databaseSchema/course-purchase.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';
import { CreateCoursePurchaseDto } from './dto/create-course-purchase.dto';
import { UpdateCoursePurchaseDto } from './dto/update-course-purchase.dto';
import { CoursePurchaseFilterDto } from './dto/course-purchase-filter.dto';
import { trans } from '../utils/trans';

@Injectable()
export class CoursePurchasesService {
  constructor(
    @InjectRepository(CoursePurchase)
    private readonly purchaseRepository: Repository<CoursePurchase>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCoursePurchaseDto, currentUserId: string, currentUserRole: string): Promise<CoursePurchase> {
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

    const purchase = this.purchaseRepository.create({
      course_id: dto.course_id,
      student_id: studentId,
      price: dto.price,
      discount: dto.discount || 0,
      final_price: dto.final_price,
      currency: dto.currency,
      payment_status: dto.payment_status,
      payment_method: dto.payment_method,
      payment_gateway: dto.payment_gateway || null,
      transaction_id: dto.transaction_id || null,
      coupon_code: dto.coupon_code || null,
    });

    return await this.purchaseRepository.save(purchase);
  }

  async findAll(query: CoursePurchaseFilterDto): Promise<any> {
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
    if (query.payment_status) {
      whereCondition.payment_status = query.payment_status;
    }

    const [items, totalItems] = await this.purchaseRepository.findAndCount({
      where: whereCondition,
      relations: { course: true, student: true },
      order: {
        purchased_at: 'DESC',
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

  async findOne(id: string): Promise<CoursePurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: { course: true, student: true },
    });
    if (!purchase) {
      throw new NotFoundException(trans('purchase.not_found'));
    }
    return purchase;
  }

  async update(id: string, dto: UpdateCoursePurchaseDto): Promise<CoursePurchase> {
    const purchase = await this.findOne(id);

    Object.assign(purchase, dto);

    return await this.purchaseRepository.save(purchase);
  }

  async remove(id: string): Promise<{ message: string }> {
    const purchase = await this.findOne(id);
    await this.purchaseRepository.remove(purchase);
    return { message: trans('purchase.deleted') };
  }
}
