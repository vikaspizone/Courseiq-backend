import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseTranslationInputDto, CoursePriceInputDto, transformJson, transformJsonArray, transformJsonObject } from './create-course.dto';
import { CourseType, CourseLevel, CourseStatus } from '../../utils/enums';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Category ID of the course',
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUUID('4', { message: () => trans('course.category_not_found') })
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    description: 'Course type (free or paid)',
    enum: CourseType,
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(CourseType, { message: () => trans('course.type_invalid') })
  @IsOptional()
  type?: CourseType;

  @ApiProperty({
    description: 'Course level',
    enum: CourseLevel,
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(CourseLevel, { message: () => trans('course.level_invalid') })
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({
    description: 'Unique course slug',
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Course thumbnail file to upload',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  thumbnail?: any;

  @ApiProperty({
    description: 'Course primary language name',
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'List of topics or tags associated with the course',
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return transformJson(value);
  })
  @IsOptional()
  topics?: any;

  @ApiProperty({
    description: 'Course status',
    enum: CourseStatus,
    required: false,
  })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(CourseStatus, { message: () => trans('course.status_invalid') })
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({
    description: 'Course translations list',
    type: [CourseTranslationInputDto],
    required: false,
  })
  @Transform(({ value, obj, key }) => {
    if (value === '') return undefined;
    return transformJsonArray(value, CourseTranslationInputDto, obj, key);
  })
  @IsArray({ message: 'Translations must be an array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInputDto)
  translations?: CourseTranslationInputDto[];

  @ApiProperty({
    description: 'Course price detail',
    type: CoursePriceInputDto,
    required: false,
  })
  @Transform(({ value, obj, key }) => {
    if (value === '') return undefined;
    return transformJsonObject(value, CoursePriceInputDto, obj, key);
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoursePriceInputDto)
  price?: CoursePriceInputDto;
}
