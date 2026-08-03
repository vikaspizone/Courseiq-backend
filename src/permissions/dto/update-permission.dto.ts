import { IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionTranslationInputDto } from './create-permission.dto';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Active status of the permission',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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
