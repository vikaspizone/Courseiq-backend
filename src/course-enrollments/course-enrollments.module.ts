import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CourseEnrollmentsController } from './course-enrollments.controller';
import { CourseEnrollment } from '../databaseSchema/course-enrollment.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEnrollment, Course, User])],
  controllers: [CourseEnrollmentsController],
  providers: [CourseEnrollmentsService],
  exports: [CourseEnrollmentsService],
})
export class CourseEnrollmentsModule {}
