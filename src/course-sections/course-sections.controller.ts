import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query, UseGuards } from '@nestjs/common';
import { CourseSectionsService } from './course-sections.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { handlePromise, cleanUndefined } from '../utils/async-handler';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Course Sections')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('course-sections')
export class CourseSectionsController {
  constructor(private readonly sectionsService: CourseSectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course section with translations' })
  async create(@Body() createDto: CreateCourseSectionDto, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(this.sectionsService.create(createDto, userId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course sections (localized)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'course_id', required: false, type: String, description: 'Filter by Course UUID' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('course_id') course_id?: string,
  ) {
    const [result, error] = await handlePromise(
      this.sectionsService.findAll({ page, limit, search, course_id }),
    );
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course section by ID (localized + translations)' })
  @ApiParam({ name: 'id', description: 'UUID of the section' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.sectionsService.findOneLocalized(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a course section and its translations' })
  @ApiParam({ name: 'id', description: 'UUID of the section' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCourseSectionDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const cleanedDto = cleanUndefined(updateDto);
    const [result, error] = await handlePromise(this.sectionsService.update(id, cleanedDto, userId));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course section by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the section' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.sectionsService.remove(id));
    if (error) throw error;
    return result;
  }
}
