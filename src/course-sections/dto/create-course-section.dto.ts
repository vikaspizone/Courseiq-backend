import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class SectionTranslationInputDto {
  @ApiProperty({
    description: 'Language code (e.g. en, hi)',
    example: 'en',
  })
  @IsString({ message: () => trans('section.lang_code_required') })
  @IsNotEmpty({ message: () => trans('section.lang_code_required') })
  @IsIn(['en', 'hi'], { message: () => trans('section.lang_code_required') })
  languageCode!: string;

  @ApiProperty({
    description: 'Section title translation',
    example: 'Week 1: Introduction to React',
  })
  @IsString({ message: () => trans('section.title_required') })
  @IsNotEmpty({ message: () => trans('section.title_required') })
  title!: string;

  @ApiProperty({
    description: 'Section description translation',
    example: 'In this section, we will learn the basics of React.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCourseSectionDto {
  @ApiProperty({
    description: 'Course UUID reference',
    example: 'a06be730-80a5-48b4-827d-0db2687a74ea',
  })
  @IsUUID('4', { message: 'Course ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Course ID is required.' })
  course_id!: string;

  @ApiProperty({
    description: 'Sort order of the section',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiProperty({
    description: 'Activity status of the section',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'List of translation objects for the section',
    type: [SectionTranslationInputDto],
  })
  @IsArray({ message: () => trans('section.translations_required') })
  @ValidateNested({ each: true })
  @Type(() => SectionTranslationInputDto)
  translations!: SectionTranslationInputDto[];
}
