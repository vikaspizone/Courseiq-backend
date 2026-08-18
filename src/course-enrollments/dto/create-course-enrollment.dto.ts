import { IsNotEmpty, IsUUID, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../utils/enums';

export class CreateCourseEnrollmentDto {
  @ApiProperty({ description: 'Course ID to enroll in', example: 'uuid-string' })
  @IsUUID('4')
  @IsNotEmpty()
  course_id!: string;

  @ApiPropertyOptional({ description: 'Student User ID (defaults to req.user.id if not admin)', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  student_id?: string;

  @ApiPropertyOptional({ description: 'Associated Purchase ID', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  purchase_id?: string;

  @ApiPropertyOptional({ description: 'Enrollment Status', enum: EnrollmentStatus, example: EnrollmentStatus.ACTIVE })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Progress percentage', example: 0 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ description: 'Access expiry date', example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  expires_at?: Date;
}
