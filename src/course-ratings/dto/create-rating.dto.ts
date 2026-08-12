import { IsUUID, IsNumber, IsString, IsOptional, Min, Max, IsArray, ValidateNested, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CourseRatingTranslationInputDto {
  @ApiProperty({ description: 'Language code (e.g. en, hi)', example: 'en' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['en', 'hi'])
  languageCode!: string;

  @ApiProperty({ description: 'Review translation text' })
  @IsString()
  @IsNotEmpty()
  review!: string;
}

export class CreateRatingDto {
  @ApiProperty({ description: 'UUID of the course being rated' })
  @IsUUID()
  course_id!: string;

  @ApiProperty({ description: 'Rating value between 1.0 and 5.0', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Translations list for the review',
    type: [CourseRatingTranslationInputDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseRatingTranslationInputDto)
  translations?: CourseRatingTranslationInputDto[];
}
