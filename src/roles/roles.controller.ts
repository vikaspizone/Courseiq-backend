import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const [result, error] = await handlePromise(this.rolesService.create(createRoleDto));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(this.rolesService.findAll(paginationDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the role' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.rolesService.findOne(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the role' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const [result, error] = await handlePromise(this.rolesService.update(id, updateRoleDto));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the role' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.rolesService.remove(id));
    if (error) throw error;
    return result;
  }
}
