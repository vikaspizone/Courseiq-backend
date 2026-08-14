import { IsOptional, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CourseInstructorFilterDto {
  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by Course UUID', required: false })
  @IsUUID('4')
  @IsOptional()
  course_id?: string;

  @ApiProperty({ description: 'Filter by Instructor UUID', required: false })
  @IsUUID('4')
  @IsOptional()
  instructor_id?: string;

  @ApiProperty({ description: 'Filter by whether they are primary instructor', required: false })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ApiProperty({ description: 'Filter by active mapping status', required: false })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
