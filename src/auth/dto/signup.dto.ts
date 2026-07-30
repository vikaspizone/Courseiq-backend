import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../utils/enums';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class SignupDto {
  @ApiProperty({
    description: trans('auth.swagger_email_desc'),
  })
  @IsEmail({}, { message: () => trans('auth.email') })
  @IsNotEmpty({ message: () => trans('auth.email_required') })
  email!: string;

  @ApiProperty({
    description: trans('auth.swagger_password_desc'),
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: () => trans('auth.password_required') })
  @MinLength(6, { message: (args) => trans('auth.password_min', { min: args.constraints[0] }) })
  password!: string;

  @ApiProperty({
    description: trans('auth.swagger_role_desc'),
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: () => trans('auth.role_enum') })
  role?: UserRole;
}

