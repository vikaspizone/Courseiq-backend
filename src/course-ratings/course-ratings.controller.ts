import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query } from '@nestjs/common';
import { CourseRatingsService } from './course-ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Course Ratings')
@ApiBearerAuth('JWT-auth')
@Controller('course-ratings')
export class CourseRatingsController {
  constructor(private readonly courseRatingsService: CourseRatingsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course ratings/reviews' })
  async getRatings(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(
      this.courseRatingsService.getRatings(paginationDto),
    );
    if (error) throw error;
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update a rating/review for a course' })
  async createOrUpdate(@Body() createDto: CreateRatingDto, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(
      this.courseRatingsService.createOrUpdate(createDto, userId),
    );
    if (error) throw error;
    return result;
  }

  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all ratings/reviews for a specific course' })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  async getRatingsByCourse(@Param('courseId', new ParseUUIDPipe()) courseId: string) {
    const [result, error] = await handlePromise(
      this.courseRatingsService.getRatingsByCourse(courseId),
    );
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course rating by rating ID' })
  @ApiParam({ name: 'id', description: 'UUID of the rating' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role?.name || '';
    const [result, error] = await handlePromise(
      this.courseRatingsService.removeRating(id, userId, userRole),
    );
    if (error) throw error;
    return result;
  }
}
