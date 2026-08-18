import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CourseLevel, CourseType } from '../../utils/enums';

export class CourseFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by course type (free or paid)',
    enum: CourseType,
  })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    type: String,
  })
  @IsOptional()
  @IsUUID('4')
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by course difficulty level',
    enum: CourseLevel,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  course_level?: CourseLevel;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Minimum average rating filter',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  min_rating?: number;

  @ApiPropertyOptional({
    description: 'Maximum average rating filter',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  max_rating?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['newest', 'price_asc', 'price_desc', 'rating_asc', 'rating_desc'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' = 'newest';
}
