import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class RefreshTokenDto {
  @ApiProperty({
    description: trans('auth.swagger_refresh_token_desc')
  })
  @IsString()
  @IsNotEmpty({ message: () => trans('auth.refresh_token_required') })
  refresh_token!: string;
}
