import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CourseInstructorsService } from './course-instructors.service';
import { CreateCourseInstructorDto } from './dto/create-course-instructor.dto';
import { UpdateCourseInstructorDto } from './dto/update-course-instructor.dto';
import { CourseInstructorFilterDto } from './dto/course-instructor-filter.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { handlePromise, cleanUndefined } from '../utils/async-handler';
import { trans } from '../utils/trans';

@ApiTags('Course Instructors')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('course-instructors')
export class CourseInstructorsController {
  constructor(private readonly courseInstructorsService: CourseInstructorsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course instructor mappings with filters and pagination' })
  async getAll(@Query() filterDto: CourseInstructorFilterDto) {
    const [result, error] = await handlePromise(this.courseInstructorsService.getAll(filterDto));
    if (error) throw error;
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign an instructor to a course' })
  async assign(@Body() dto: CreateCourseInstructorDto, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(this.courseInstructorsService.assign(dto, userId));
    if (error) throw error;

    return {
      message: trans('course_instructor.created'),
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get course instructor mapping details by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the course instructor mapping' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.courseInstructorsService.getById(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update course instructor mapping details' })
  @ApiParam({ name: 'id', description: 'UUID of the course instructor mapping' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCourseInstructorDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const cleanedDto = cleanUndefined(dto);
    const [result, error] = await handlePromise(this.courseInstructorsService.update(id, cleanedDto, userId));
    if (error) throw error;

    return {
      message: trans('course_instructor.updated'),
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an instructor from a course' })
  @ApiParam({ name: 'id', description: 'UUID of the course instructor mapping' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.courseInstructorsService.delete(id));
    if (error) throw error;
    return result;
  }
}
