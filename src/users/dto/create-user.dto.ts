import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

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
    description: 'Profile image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  profile_image?: string;

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
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Is active user',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'User qualification details (JSON)',
    example: { degree: 'CS', year: 2018 },
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
    example: ['English', 'Hindi'],
    required: false,
  })
  @IsOptional()
  languages?: any;

  @ApiProperty({
    description: 'Address details (JSON)',
    example: { city: 'Noida', country: 'India' },
    required: false,
  })
  @IsOptional()
  address?: any;

  @ApiProperty({
    description: 'Work experience/history details (JSON)',
    example: { company: 'Google', title: 'Engineer' },
    required: false,
  })
  @IsOptional()
  work?: any;

  @ApiProperty({
    description: 'UUID of the role assigned to user',
  })
  @IsUUID('4', { message: () => trans('user.role_invalid') })
  @IsNotEmpty({ message: () => trans('user.role_required') })
  role_id!: string;
}
