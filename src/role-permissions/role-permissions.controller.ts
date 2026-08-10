import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Role Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update role permission mapping' })
  async create(@Body() dto: CreateRolePermissionDto) {
    const [result, error] = await handlePromise(this.rolePermissionsService.create(dto));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all role permission mappings' })
  @ApiQuery({ name: 'role_id', required: false, description: 'Filter by role UUID' })
  async findAll(@Query() paginationDto: PaginationDto, @Query('role_id') role_id?: string) {
    const [result, error] = await handlePromise(this.rolePermissionsService.findAll(paginationDto, role_id));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get role permission mapping by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the mapping' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.rolePermissionsService.findOne(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update role permission mapping' })
  @ApiParam({ name: 'id', description: 'UUID of the mapping' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    const [result, error] = await handlePromise(this.rolePermissionsService.update(id, updateRolePermissionDto));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete role permission mapping' })
  @ApiParam({ name: 'id', description: 'UUID of the mapping' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.rolePermissionsService.remove(id));
    if (error) throw error;
    return result;
  }
}
