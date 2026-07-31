import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';
import { CategoryTranslationInputDto } from './create-course-category.dto';

export class UpdateCourseCategoryDto {
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
