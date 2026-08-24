import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FavoriteCourseFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by Course ID',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsUUID('4', { message: 'course_id must be a valid UUID' })
  course_id?: string;
}
