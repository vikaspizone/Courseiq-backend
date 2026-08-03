import { IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
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
  isActive?: boolean;

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
