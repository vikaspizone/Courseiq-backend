import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';
import { CourseEnrollmentFilterDto } from './dto/course-enrollment-filter.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { handlePromise } from '../utils/async-handler';
import { trans } from '../utils/trans';

@ApiTags('Course Enrollments')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('course-enrollments')
export class CourseEnrollmentsController {
  constructor(private readonly enrollmentsService: CourseEnrollmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll a student in a course' })
  async enroll(@Body() createDto: CreateCourseEnrollmentDto, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role?.name || '';
    const [result, error] = await handlePromise(
      this.enrollmentsService.create(createDto, userId, userRole)
    );
    if (error) throw error;
    return {
      message: trans('enrollment.created'),
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course enrollments with pagination and filters' })
  async findAll(@Query() filterDto: CourseEnrollmentFilterDto) {
    const [result, error] = await handlePromise(this.enrollmentsService.findAll(filterDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get course enrollment details by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the enrollment' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.enrollmentsService.findOne(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update course enrollment progress or status' })
  @ApiParam({ name: 'id', description: 'UUID of the enrollment' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCourseEnrollmentDto,
  ) {
    const [result, error] = await handlePromise(this.enrollmentsService.update(id, updateDto));
    if (error) throw error;
    return {
      message: trans('enrollment.updated'),
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel or delete a course enrollment' })
  @ApiParam({ name: 'id', description: 'UUID of the enrollment' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.enrollmentsService.remove(id));
    if (error) throw error;
    return result;
  }
}
