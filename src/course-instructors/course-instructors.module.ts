import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseInstructorsService } from './course-instructors.service';
import { CourseInstructorsController } from './course-instructors.controller';
import { CourseInstructor } from '../databaseSchema/course-instructor.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CourseInstructor, Course, User])],
  controllers: [CourseInstructorsController],
  providers: [CourseInstructorsService],
  exports: [CourseInstructorsService],
})
export class CourseInstructorsModule {}
