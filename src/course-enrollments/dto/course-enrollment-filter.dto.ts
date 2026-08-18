import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EnrollmentStatus } from '../../utils/enums';

export class CourseEnrollmentFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Course ID', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  course_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Student User ID', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  student_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Enrollment Status', enum: EnrollmentStatus, example: EnrollmentStatus.ACTIVE })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
}
