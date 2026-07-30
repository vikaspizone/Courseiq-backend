import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class LoginDto {
  @ApiProperty({
    description: trans('auth.swagger_email_desc')
  })
  @IsEmail({}, { message: () => trans('auth.email') })
  @IsNotEmpty({ message: () => trans('auth.email_required') })
  email!: string;

  @ApiProperty({
    description: trans('auth.swagger_password_login_desc')
  })
  @IsString()
  @IsNotEmpty({ message: () => trans('auth.password_required') })
  password!: string;
}
