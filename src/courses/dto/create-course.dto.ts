import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseType, CourseLevel, CourseStatus, DiscountType } from '../../utils/enums';

export function transformJsonArray(value: any, cls: any) {
  if (value === undefined || value === null) {
    return value;
  }
  let parsedValue = value;
  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (Array.isArray(parsedValue)) {
    const parsedItems = parsedValue.map((item) => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    });
    return plainToInstance(cls, parsedItems);
  }
  if (typeof parsedValue === 'object') {
    return plainToInstance(cls, [parsedValue]);
  }
  return parsedValue;
}

export function transformJson(value: any) {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export class CoursePriceInputDto {
  @ApiProperty({ description: 'Currency (e.g. INR, USD)', example: 'INR' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ description: 'Base price of the course', example: 999.00 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: 'Discount price', required: false, example: 499.00 })
  @IsNumber()
  @IsOptional()
  discount_price?: number;

  @ApiProperty({ description: 'Discount type (fixed or percentage)', enum: DiscountType, required: false })
  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @ApiProperty({ description: 'Discount value', required: false, example: 500.00 })
  @IsNumber()
  @IsOptional()
  discount_value?: number;

  @ApiProperty({ description: 'Discount start date', required: false })
  @IsOptional()
  discount_start_at?: Date;

  @ApiProperty({ description: 'Discount end date', required: false })
  @IsOptional()
  discount_end_at?: Date;
}

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
    description: 'Course thumbnail file to upload',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  thumbnail?: any;

  @ApiProperty({
    description: 'Course image file to upload',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;

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
  @Transform(({ value }) => transformJson(value))
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
  @Transform(({ value }) => transformJsonArray(value, CourseTranslationInputDto))
  @IsArray({ message: 'Translations must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInputDto)
  translations!: CourseTranslationInputDto[];

  @ApiProperty({
    description: 'Course price detail',
    type: CoursePriceInputDto,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (typeof value === 'string') {
      try {
        return plainToInstance(CoursePriceInputDto, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return plainToInstance(CoursePriceInputDto, value);
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoursePriceInputDto)
  price?: CoursePriceInputDto;
}
