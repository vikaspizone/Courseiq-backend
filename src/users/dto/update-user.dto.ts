import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trans } from '../../utils/trans';
import { transformJson } from './create-user.dto';

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
    description: 'Profile image file to upload',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profile_image?: any;



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
  date_of_birth?: string;

  @ApiProperty({
    description: 'Is active user',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  is_active?: boolean;

  @ApiProperty({
    description: 'User qualification details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  qualification?: any;

  @ApiProperty({
    description: 'Experience in years',
    required: false,
  })
  @IsNumber({}, { message: () => trans('user.experience_invalid') })
  @IsOptional()
  @Transform(({ value }) => {
    return value !== undefined && value !== null ? Number(value) : value;
  })
  experience?: number;

  @ApiProperty({
    description: 'Languages spoken (JSON)',
    example: [],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  languages?: any;

  @ApiProperty({
    description: 'Address details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  address?: any;

  @ApiProperty({
    description: 'Work experience/history details (JSON)',
    example: {},
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  work?: any;

  @ApiProperty({
    description: 'UUID of the role assigned to user',
    required: false,
  })
  @IsUUID('4', { message: () => trans('user.role_invalid') })
  @IsOptional()
  role_id?: string;
}
