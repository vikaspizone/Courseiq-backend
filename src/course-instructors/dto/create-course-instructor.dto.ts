import { IsUUID, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseInstructorDto {
  @ApiProperty({ description: 'UUID of the course', example: 'uuid-string' })
  @IsUUID('4')
  @IsNotEmpty()
  course_id!: string;

  @ApiProperty({ description: 'UUID of the instructor/user', example: 'uuid-string' })
  @IsUUID('4')
  @IsNotEmpty()
  instructor_id!: string;

  @ApiProperty({ description: 'Whether this instructor is primary', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ApiProperty({ description: 'Whether this mapping is active', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
