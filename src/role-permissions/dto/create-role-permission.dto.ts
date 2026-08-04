import { IsNotEmpty, IsUUID, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolePermissionDto {
  @ApiProperty({
    description: 'UUID of the role',
  })
  @IsUUID()
  @IsNotEmpty()
  role_id!: string;

  @ApiProperty({
    description: 'UUID of the module',
  })
  @IsUUID()
  @IsNotEmpty()
  module_id!: string;

  @ApiProperty({
    description: 'Array of Permission UUIDs',
    example: [],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  permission_ids!: string[];
}
