import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, UseGuards, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { handlePromise } from '../utils/async-handler';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { getMulterOptions } from '../config/multer.config';

@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course with translations' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
    ], getMulterOptions('image', 'courses')),
  )
  async create(
    @Body() createDto: CreateCourseDto,
    @Request() req,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
  ) {
    const userId = req.user.id;
    if (files) {
      if (files.thumbnail && files.thumbnail.length > 0) {
        createDto.thumbnail = `/uploads/images/courses/${files.thumbnail[0].filename}`;
      }
    }
    const [result, error] = await handlePromise(this.coursesService.create(createDto, userId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all courses (localized)' })
  async findAll(@Query() filterDto: CourseFilterDto) {
    const [result, error] = await handlePromise(this.coursesService.findAll(filterDto));
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
    ], getMulterOptions('image', 'courses')),
  )
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCourseDto,
    @Request() req,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
  ) {
    const userId = req.user.id;
    if (files) {
      if (files.thumbnail && files.thumbnail.length > 0) {
        updateDto.thumbnail = `/uploads/images/courses/${files.thumbnail[0].filename}`;
      }
    }
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
