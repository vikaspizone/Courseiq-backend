import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course with translations' })
  async create(@Body() createDto: CreateCourseDto, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(this.coursesService.create(createDto, userId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all courses (localized)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(this.coursesService.findAll(paginationDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course by ID (localized + translations)' })
  @ApiParam({ name: 'id', description: 'UUID of the course' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.coursesService.findOneLocalized(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a course and its translations' })
  @ApiParam({ name: 'id', description: 'UUID of the course' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCourseDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(this.coursesService.update(id, updateDto, userId));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the course' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.coursesService.remove(id));
    if (error) throw error;
    return result;
  }
}
