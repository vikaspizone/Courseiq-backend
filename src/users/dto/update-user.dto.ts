import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsUUID, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString({ message: () => trans('user.name_string') })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: trans('auth.swagger_email_desc'),
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: () => trans('user.email_invalid') })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Gender of the user (male, female, other)',
    example: 'male',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsEnum(['male', 'female', 'other'], { message: () => trans('user.gender_invalid') })
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({
    description: trans('auth.swagger_password_desc'),
    minLength: 6,
    required: false,
  })
  @IsString()
  @MinLength(6, { message: (args) => trans('user.password_min', { min: args.constraints[0] }) })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'About information',
    example: 'Short bio...',
    required: false,
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({
    description: 'Date of birth (YYYY-MM-DD)',
    example: '1995-12-15',
    required: false,
  })
  @IsDateString({}, { message: () => trans('user.dob_invalid') })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Is active user',
    example: true,
    required: false,
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
    example: 4.5,
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
    example: 'b06be730-80a5-48b4-827d-0db2687a74ea',
    required: false,
  })
  @IsUUID('4', { message: () => trans('user.role_invalid') })
  @IsOptional()
  roleId?: string;
}
