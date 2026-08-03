import { IsUUID, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionDto {
  @ApiProperty({
    description: 'UUID of the role',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  role_id?: string;

  @ApiProperty({
    description: 'UUID of the module',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @ApiProperty({
    description: 'Array of Permission UUIDs',
    example: [],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  permissionIds?: string[];
}
