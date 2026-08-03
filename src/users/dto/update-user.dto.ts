import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    required: false,
  })
  @IsString({ message: () => trans('user.name_string') })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: trans('auth.swagger_email_desc'),
    required: false,
  })
  @IsEmail({}, { message: () => trans('user.email_invalid') })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Gender of the user (male, female, other)',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsEnum(['male', 'female', 'other'], { message: () => trans('user.gender_invalid') })
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Profile image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  profile_image?: string;



  @ApiProperty({
    description: 'About information',
    required: false,
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({
    description: 'Date of birth (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: () => trans('user.dob_invalid') })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Is active user',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'User qualification details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  qualification?: any;

  @ApiProperty({
    description: 'Experience in years',
    required: false,
  })
  @IsNumber({}, { message: () => trans('user.experience_invalid') })
  @IsOptional()
  experience?: number;

  @ApiProperty({
    description: 'Languages spoken (JSON)',
    example: [],
    required: false,
  })
  @IsOptional()
  languages?: any;

  @ApiProperty({
    description: 'Address details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  address?: any;

  @ApiProperty({
    description: 'Work experience/history details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  work?: any;

  @ApiProperty({
    description: 'UUID of the role assigned to user',
    required: false,
  })
  @IsUUID('4', { message: () => trans('user.role_invalid') })
  @IsOptional()
  role_id?: string;
}
