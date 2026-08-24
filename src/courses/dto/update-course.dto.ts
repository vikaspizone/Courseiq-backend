import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum, ValidateIf } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseTranslationInputDto, CoursePriceInputDto, transformJson, transformJsonArray, transformJsonObject, MediaMetadataInputDto } from './create-course.dto';
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
    description: 'Media metadata array describing each file or URL in the media uploads',
    type: [MediaMetadataInputDto],
    required: false,
  })
  @Transform(({ value, obj, key }) => {
    if (value === '') return undefined;
    return transformJsonArray(value, MediaMetadataInputDto, obj, key);
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MediaMetadataInputDto)
  media?: MediaMetadataInputDto[];

  @ApiProperty({
    description: 'Course media files to upload (images, videos, or documents)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  mediaFiles?: any[];

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
    description: 'Course price detail (Required if type is paid)',
    type: CoursePriceInputDto,
    required: false,
  })
  @Transform(({ value, obj, key }) => {
    if (value === '') return undefined;
    return transformJsonObject(value, CoursePriceInputDto, obj, key);
  })
  @ValidateIf(o => o.type === CourseType.PAID || o.type === 'paid')
  @IsNotEmpty({ message: 'Price detail is required when course type is paid' })
  @ValidateNested()
  @Type(() => CoursePriceInputDto)
  price?: CoursePriceInputDto;
}
