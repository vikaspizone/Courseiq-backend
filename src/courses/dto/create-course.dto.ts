import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CourseType, CourseLevel, CourseStatus, DiscountType } from '../../utils/enums';

export function transformJsonArray(value: any, cls: any, obj?: any, key?: string) {
  if (value !== undefined && value !== null && value !== '') {
    let parsedValue = value;
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        // Not a JSON string, fallback to reconstruction or return value
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
  }

  if (obj && key) {
    const list: any[] = [];
    const keys = Object.keys(obj);
    const regex1 = new RegExp(`^${key}\\[(\\d+)\\]\\[(\\w+)\\]$`);
    const regex2 = new RegExp(`^${key}\\[(\\d+)\\]\\.(\\w+)$`);
    const regex3 = new RegExp(`^${key}\\[(\\d+)\\]$`);

    for (const k of keys) {
      let match = k.match(regex1);
      if (match) {
        const idx = parseInt(match[1], 10);
        const prop = match[2];
        if (!list[idx]) list[idx] = {};
        list[idx][prop] = obj[k];
        continue;
      }

      match = k.match(regex2);
      if (match) {
        const idx = parseInt(match[1], 10);
        const prop = match[2];
        if (!list[idx]) list[idx] = {};
        list[idx][prop] = obj[k];
        continue;
      }

      match = k.match(regex3);
      if (match) {
        const idx = parseInt(match[1], 10);
        list[idx] = obj[k];
        continue;
      }
    }

    const cleanedList = list.filter(item => item !== undefined).map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    });

    if (cleanedList.length > 0) {
      return plainToInstance(cls, cleanedList);
    }
  }

  return value;
}

export function transformJsonObject(value: any, cls: any, obj?: any, key?: string) {
  if (value !== undefined && value !== null && value !== '') {
    if (typeof value === 'string') {
      try {
        return plainToInstance(cls, JSON.parse(value));
      } catch {
        return value;
      }
    }
    return plainToInstance(cls, value);
  }

  if (obj && key) {
    const keys = Object.keys(obj);
    const regex1 = new RegExp(`^${key}\\[(\\w+)\\]$`);
    const regex2 = new RegExp(`^${key}\\.(\\w+)$`);
    const result: any = {};
    let found = false;

    for (const k of keys) {
      let match = k.match(regex1);
      if (match) {
        const prop = match[1];
        result[prop] = obj[k];
        found = true;
        continue;
      }

      match = k.match(regex2);
      if (match) {
        const prop = match[1];
        result[prop] = obj[k];
        found = true;
        continue;
      }
    }

    if (found) {
      for (const prop of Object.keys(result)) {
        if (typeof result[prop] === 'string' && result[prop] !== '' && !isNaN(Number(result[prop]))) {
          result[prop] = Number(result[prop]);
        }
      }
      return plainToInstance(cls, result);
    }
  }

  return value;
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
  @Transform(({ value, obj, key }) => transformJsonArray(value, CourseTranslationInputDto, obj, key))
  @IsArray({ message: 'Translations must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseTranslationInputDto)
  translations!: CourseTranslationInputDto[];

  @ApiProperty({
    description: 'Course price detail',
    type: CoursePriceInputDto,
    required: false,
  })
  @Transform(({ value, obj, key }) => transformJsonObject(value, CoursePriceInputDto, obj, key))
  @IsOptional()
  @ValidateNested()
  @Type(() => CoursePriceInputDto)
  price?: CoursePriceInputDto;
}
