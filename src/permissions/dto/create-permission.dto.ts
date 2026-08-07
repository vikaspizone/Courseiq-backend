import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionTranslationInputDto {
  @ApiProperty({
    description: 'Language code (e.g. en, hi)',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['en', 'hi'])
  languageCode!: string;

  @ApiProperty({
    description: 'Unique name of the permission',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Unique code identifier for the permission',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Active status of the permission',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'List of translation objects for the permission name',
    type: [PermissionTranslationInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionTranslationInputDto)
  translations!: PermissionTranslationInputDto[];
}
