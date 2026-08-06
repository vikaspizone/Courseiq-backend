import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleTranslationInputDto {
  @ApiProperty({
    description: 'Language code (e.g. en, hi)',
    example: 'en',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['en', 'hi'])
  languageCode!: string;

  @ApiProperty({
    description: 'Unique name of the module',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateModuleDto {
  @ApiProperty({
    description: 'Active status of the module',
    required: false,
    default: true,
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
    description: 'List of translation objects for the module name',
    type: [ModuleTranslationInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleTranslationInputDto)
  translations!: ModuleTranslationInputDto[];
}
