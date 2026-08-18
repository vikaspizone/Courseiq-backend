import { IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../utils/enums';

export class UpdateCourseEnrollmentDto {
  @ApiPropertyOptional({ description: 'Enrollment Status', enum: EnrollmentStatus, example: EnrollmentStatus.COMPLETED })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Progress percentage', example: 50.5 })
  @IsNumber()
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ description: 'Course start date', example: '2026-08-17T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  started_at?: Date;

  @ApiPropertyOptional({ description: 'Course complete date', example: '2026-08-18T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  completed_at?: Date;

  @ApiPropertyOptional({ description: 'Course access expiry date', example: '2027-08-17T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  expires_at?: Date;

  @ApiPropertyOptional({ description: 'Student last accessed date', example: '2026-08-17T15:00:00Z' })
  @IsDateString()
  @IsOptional()
  last_accessed_at?: Date;
}
