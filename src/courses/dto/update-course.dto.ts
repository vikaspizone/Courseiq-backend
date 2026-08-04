import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseTranslationInputDto } from './create-course.dto';
import { CourseType, CourseLevel, CourseStatus } from '../../utils/enums';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Category ID of the course',
    required: false,
  })
  @IsUUID('4', { message: () => trans('course.category_not_found') })
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    description: 'Course type (free or paid)',
    enum: CourseType,
    required: false,
  })
  @IsEnum(CourseType, { message: () => trans('course.type_invalid') })
  @IsOptional()
  type?: CourseType;

  @ApiProperty({
    description: 'Course level',
    enum: CourseLevel,
    required: false,
  })
  @IsEnum(CourseLevel, { message: () => trans('course.level_invalid') })
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({
    description: 'Unique course slug',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Course thumbnail URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Course image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Course primary language name',
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'List of topics or tags associated with the course',
    required: false,
  })
  @IsOptional()
  topics?: any;


  @ApiProperty({
    description: 'Course status',
    enum: CourseStatus,
    required: false,
  })
  @IsEnum(CourseStatus, { message: () => trans('course.status_invalid') })
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({
    description: 'Course translations list',
    type: [CourseTranslationInputDto],
    required: false,
  })
  @IsArray({ message: 'Translations must be an array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInputDto)
  translations?: CourseTranslationInputDto[];
}
