import { IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean, IsInt, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { LessonType } from '../../utils/enums';
import { LessonTranslationInputDto } from './create-lesson.dto';
import { MediaMetadataInputDto, transformJsonArray } from '../../courses/dto/create-course.dto';

export class UpdateLessonDto {
  @ApiProperty({
    description: 'Course UUID reference',
    example: 'a06be730-80a5-48b4-827d-0db2687a74ea',
    required: false,
  })
  @IsUUID('4', { message: 'Course ID must be a valid UUID.' })
  @IsOptional()
  course_id?: string;

  @ApiProperty({
    description: 'Section UUID reference',
    example: 'd199cf06-f6d2-436f-a2e6-a06be73080a5',
    required: false,
  })
  @IsUUID('4', { message: 'Section ID must be a valid UUID.' })
  @IsOptional()
  section_id?: string;

  @ApiProperty({
    description: 'Lesson type (video, text, document, quiz)',
    enum: LessonType,
    required: false,
  })
  @IsEnum(LessonType, { message: () => trans('lesson.type_invalid') })
  @IsOptional()
  type?: LessonType;

  @ApiProperty({
    description: 'Duration in seconds',
    example: 1200,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return Number(value);
  })
  @IsInt({ message: () => trans('lesson.duration_invalid') })
  @Min(0, { message: () => trans('lesson.duration_invalid') })
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'Lesson display order',
    example: 1,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return Number(value);
  })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiProperty({
    description: 'Free preview status',
    example: false,
    required: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_preview?: boolean;

  @ApiProperty({
    description: 'Activity status of the lesson',
    example: true,
    required: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Lesson translations list',
    type: [LessonTranslationInputDto],
    required: false,
  })
  @Transform(({ value, obj, key }) => transformJsonArray(value, LessonTranslationInputDto, obj, key))
  @IsArray({ message: () => trans('lesson.translations_required') })
  @ValidateNested({ each: true })
  @Type(() => LessonTranslationInputDto)
  @IsOptional()
  translations?: LessonTranslationInputDto[];

  @ApiProperty({
    description: 'Media metadata array describing each file or URL in the media uploads',
    type: [MediaMetadataInputDto],
    required: false,
  })
  @Transform(({ value, obj, key }) => transformJsonArray(value, MediaMetadataInputDto, obj, key))
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MediaMetadataInputDto)
  media?: MediaMetadataInputDto[];

  @ApiProperty({
    description: 'Lesson media files to upload',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  mediaFiles?: any[];
}
