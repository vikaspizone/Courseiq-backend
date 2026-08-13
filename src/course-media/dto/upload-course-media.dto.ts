import { IsNotEmpty, IsString, IsUUID, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseMediaType } from '../../utils/enums';
import { Transform } from 'class-transformer';

export class UploadCourseMediaDto {
  @ApiProperty({ description: 'Course ID this media belongs to', example: 'uuid-string' })
  @IsUUID('4')
  @IsNotEmpty()
  course_id!: string;

  @ApiProperty({ description: 'Media type', enum: CourseMediaType, example: CourseMediaType.IMAGE })
  @IsEnum(CourseMediaType)
  @IsNotEmpty()
  type!: CourseMediaType;

  @ApiProperty({ description: 'Whether the media is active', example: true, required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Binary media file to upload',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file!: any;
}
