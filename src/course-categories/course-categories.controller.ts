import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Course Categories')
@ApiBearerAuth('JWT-auth')
@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly categoriesService: CourseCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course category with translations' })
  async create(@Body() createDto: CreateCourseCategoryDto, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(this.categoriesService.create(createDto, userId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course categories (localized)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(this.categoriesService.findAll(paginationDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course category by ID (localized + translations)' })
  @ApiParam({ name: 'id', description: 'UUID of the category' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.categoriesService.findOneLocalized(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a course category and its translations' })
  @ApiParam({ name: 'id', description: 'UUID of the category' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCourseCategoryDto,
  ) {
    const [result, error] = await handlePromise(this.categoriesService.update(id, updateDto));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course category by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the category' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.categoriesService.remove(id));
    if (error) throw error;
    return result;
  }
}
