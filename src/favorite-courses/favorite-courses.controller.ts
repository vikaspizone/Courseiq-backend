import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query } from '@nestjs/common';
import { FavoriteCoursesService } from './favorite-courses.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { IsUUID } from 'class-validator';
import { FavoriteCourseFilterDto } from './dto/favorite-course-filter.dto';

@ApiTags('Favorite Courses')
@ApiBearerAuth('JWT-auth')
@Controller('favorite-courses')
export class FavoriteCoursesController {
  constructor(private readonly favoriteCoursesService: FavoriteCoursesService) {}

  @Post(':courseId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a course to favorites' })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  async addFavorite(@Param('courseId', new ParseUUIDPipe()) courseId: string, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(
      this.favoriteCoursesService.addFavorite(courseId, userId),
    );
    if (error) throw error;
    return result;
  }

  @Delete(':courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a course from favorites' })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  async removeFavorite(@Param('courseId', new ParseUUIDPipe()) courseId: string, @Request() req) {
    const userId = req.user.id;
    const [result, error] = await handlePromise(
      this.favoriteCoursesService.removeFavorite(courseId, userId),
    );
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all favorite courses of the authenticated user' })
  async getFavorites(@Query() filterDto: FavoriteCourseFilterDto, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role?.name || '';
    const [result, error] = await handlePromise(
      this.favoriteCoursesService.getFavorites(filterDto, userId, userRole),
    );
    if (error) throw error;
    return result;
  }
}
