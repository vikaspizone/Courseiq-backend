import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trans } from '../../utils/trans';

export function transformJson(value: any) {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user',
  })
  @IsString({ message: () => trans('user.name_string') })
  @IsNotEmpty({ message: () => trans('user.name_required') })
  name!: string;

  @ApiProperty({
    description: trans('auth.swagger_email_desc'),
  })
  @IsEmail({}, { message: () => trans('user.email_invalid') })
  @IsNotEmpty({ message: () => trans('user.email_required') })
  email!: string;

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
    description: trans('auth.swagger_password_desc'),
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: () => trans('user.password_required') })
  @MinLength(6, { message: (args) => trans('user.password_min', { min: args.constraints[0] }) })
  password!: string;

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
    default: true,
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
    example: { degree: 'CS', year: 2018 },
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
    example: ['English', 'Hindi'],
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  languages?: any;

  @ApiProperty({
    description: 'Address details (JSON)',
    example: { city: 'Noida', country: 'India' },
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  address?: any;

  @ApiProperty({
    description: 'Work experience/history details (JSON)',
    example: { company: 'Google', title: 'Engineer' },
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => transformJson(value))
  work?: any;

  @ApiProperty({
    description: 'UUID of the role assigned to user',
  })
  @IsUUID('4', { message: () => trans('user.role_invalid') })
  @IsNotEmpty({ message: () => trans('user.role_required') })
  role_id!: string;
}
