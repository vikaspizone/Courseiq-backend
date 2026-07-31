import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trans } from '../../utils/trans';

export class UpdateRoleDto {
  @ApiProperty({
    description: trans('role.swagger_name_desc'),
    example: 'moderator',
  })
  @IsString({ message: () => trans('role.name_string') })
  @IsNotEmpty({ message: () => trans('role.name_required') })
  name!: string;

  @ApiProperty({
    description: 'Active status of the role',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
