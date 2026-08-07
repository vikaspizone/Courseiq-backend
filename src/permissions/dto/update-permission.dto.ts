import { IsBoolean, IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionTranslationInputDto } from './create-permission.dto';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Unique code identifier for the permission',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Active status of the permission',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'List of translation objects for the permission name',
    type: [PermissionTranslationInputDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionTranslationInputDto)
  translations?: PermissionTranslationInputDto[];
}
