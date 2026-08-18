import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePurchasesService } from './course-purchases.service';
import { CoursePurchasesController } from './course-purchases.controller';
import { CoursePurchase } from '../databaseSchema/course-purchase.schema';
import { Course } from '../databaseSchema/course.schema';
import { User } from '../databaseSchema/user.schema';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePurchase, Course, User])],
  controllers: [CoursePurchasesController],
  providers: [CoursePurchasesService],
  exports: [CoursePurchasesService],
})
export class CoursePurchasesModule {}
