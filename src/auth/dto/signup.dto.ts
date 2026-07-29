import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../utils/enums';

export class SignupDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be ADMIN, INSTRUCTOR, or STUDENT.' })
  role?: UserRole;
}

