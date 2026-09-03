import { IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { SectionTranslationInputDto } from './create-course-section.dto';

export class UpdateCourseSectionDto {
  @ApiProperty({
    description: 'Course UUID reference',
    example: 'a06be730-80a5-48b4-827d-0db2687a74ea',
    required: false,
  })
  @IsUUID('4', { message: 'Course ID must be a valid UUID.' })
  @IsOptional()
  course_id?: string;

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
    required: false,
  })
  @IsArray({ message: () => trans('section.translations_required') })
  @ValidateNested({ each: true })
  @Type(() => SectionTranslationInputDto)
  @IsOptional()
  translations?: SectionTranslationInputDto[];
}
