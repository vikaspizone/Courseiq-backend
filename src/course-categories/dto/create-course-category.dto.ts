import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class CategoryTranslationInputDto {
  @ApiProperty({
    description: 'Language code (e.g. en, hi)',
    example: 'en',
  })
  @IsString({ message: () => trans('category.lang_code_required') })
  @IsNotEmpty({ message: () => trans('category.lang_code_required') })
  @IsIn(['en', 'hi'], { message: () => trans('category.lang_code_required') })
  languageCode!: string;

  @ApiProperty({
    description: 'Category title translation',
    example: 'Development',
  })
  @IsString({ message: () => trans('category.title_required') })
  @IsNotEmpty({ message: () => trans('category.title_required') })
  title!: string;

  @ApiProperty({
    description: 'Category description translation',
    example: 'Course category for coding courses',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCourseCategoryDto {
  @ApiProperty({
    description: trans('category.swagger_status_desc'),
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'], { message: () => trans('category.status_invalid') })
  status?: string;

  @ApiProperty({
    description: trans('category.swagger_parent_desc'),
    example: 'a06be730-80a5-48b4-827d-0db2687a74ea',
    required: false,
  })
  @IsUUID('4', { message: () => trans('category.parent_not_found') })
  @IsOptional()
  parentId?: string | null;

  @ApiProperty({
    description: trans('category.swagger_translations_desc'),
    type: [CategoryTranslationInputDto],
  })
  @IsArray({ message: () => trans('category.translations_required') })
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationInputDto)
  translations!: CategoryTranslationInputDto[];
}
