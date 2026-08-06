import { IsBoolean, IsOptional, IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleTranslationInputDto } from './create-module.dto';

export class UpdateModuleDto {
  @ApiProperty({
    description: 'Active status of the module',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Icon of the module',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Route path of the module',
    required: false,
  })
  @IsString()
  @IsOptional()
  route?: string;

  @ApiProperty({
    description: 'Sort order of the module',
    required: false,
  })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiProperty({
    description: 'List of translation objects for the module name',
    type: [ModuleTranslationInputDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModuleTranslationInputDto)
  translations?: ModuleTranslationInputDto[];
}
