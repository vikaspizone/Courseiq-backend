import { IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CourseMediaFilterDto {
  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @Transform(({ value }) => value ? parseInt(value, 10) : 10)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Filter only active media items', required: false })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isActiveOnly?: boolean;
}
