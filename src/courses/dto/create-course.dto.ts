import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseType, CourseLevel, CourseStatus } from '../../utils/enums';

export class CourseTranslationInputDto {
  @ApiProperty({
    description: 'Language code (e.g. en, hi)',
    example: 'en',
  })
  @IsString({ message: () => trans('course.lang_code_required')})
  @IsNotEmpty({ message: () => trans('course.lang_code_required')})
  @IsIn(['en', 'hi'], { message: () => trans('course.lang_code_required')})
  languageCode!: string;

  @ApiProperty({
    description: 'Course title translation',
  })
  @IsString({ message: () => trans('course.title_required')})
  @IsNotEmpty({ message: () => trans('course.title_required')})
  title!: string;

  @ApiProperty({
    description: 'Course description translation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Course overview translation',
    required: false,
  })
  @IsString()
  @IsOptional()
  overview?: string;
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'Category ID of the course',
  })
  @IsUUID('4', { message: () => trans('course.category_not_found') })
  @IsNotEmpty({ message: () => trans('course.category_not_found') })
  category_id!: string;

  @ApiProperty({
    description: 'Course type (free or paid)',
    enum: CourseType,
  })
  @IsEnum(CourseType, { message: () => trans('course.type_invalid') })
  type!: CourseType;

  @ApiProperty({
    description: 'Course level',
    enum: CourseLevel,
  })
  @IsEnum(CourseLevel, { message: () => trans('course.level_invalid') })
  level!: CourseLevel;

  @ApiProperty({
    description: 'Unique course slug',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

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
    example: 'draft',
    enum: CourseStatus,
    required: false,
  })
  @IsEnum(CourseStatus, { message: () => trans('course.status_invalid') })
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({
    description: 'Course translations list',
    type: [CourseTranslationInputDto],
  })
  @IsArray({ message: 'Translations must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInputDto)
  translations!: CourseTranslationInputDto[];
}
