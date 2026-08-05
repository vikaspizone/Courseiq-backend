import { IsUUID, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'UUID of the course being rated' })
  @IsUUID()
  course_id!: string;

  @ApiProperty({ description: 'Rating value between 1.0 and 5.0', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ description: 'Review text/comment', required: false })
  @IsString()
  @IsOptional()
  review?: string;
}
