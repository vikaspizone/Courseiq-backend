import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Modules')
@ApiBearerAuth('JWT-auth')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new module' })
  async create(@Body() createModuleDto: CreateModuleDto) {
    const [result, error] = await handlePromise(this.modulesService.create(createModuleDto));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all modules' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(this.modulesService.findAll(paginationDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the module' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.modulesService.findOneLocalized(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a module by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the module' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    const [result, error] = await handlePromise(this.modulesService.update(id, updateModuleDto));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a module by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the module' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.modulesService.remove(id));
    if (error) throw error;
    return result;
  }
}
