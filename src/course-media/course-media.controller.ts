import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, UseInterceptors, UploadedFile, BadRequestException, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseMediaService } from './course-media.service';
import { UploadCourseMediaDto } from './dto/upload-course-media.dto';
import { UpdateCourseMediaDto } from './dto/update-course-media.dto';
import { CourseMediaFilterDto } from './dto/course-media-filter.dto';
import { getMulterOptions } from '../config/multer.config';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { handlePromise } from '../utils/async-handler';
import { trans } from '../utils/trans';

@ApiTags('Course Media')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('course-media')
export class CourseMediaController {
  constructor(private readonly courseMediaService: CourseMediaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course media items with pagination' })
  async getAll(@Query() filterDto: CourseMediaFilterDto) {
    const [result, error] = await handlePromise(this.courseMediaService.getAllMedia(filterDto));
    if (error) throw error;
    return result;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload and create course media' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', getMulterOptions('any', 'course-media')))
  async uploadMedia(
    @Body() dto: UploadCourseMediaDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.id;
    let createDto: any;

    if (file) {
      const destIndex = file.destination.replace(/\\/g, '/').indexOf('uploads/');
      const relativePath = destIndex !== -1 ? file.destination.replace(/\\/g, '/').substring(destIndex) + '/' + file.filename : `uploads/files/${file.filename}`;
      const fileUrl = '/' + relativePath;

      createDto = {
        course_id: dto.course_id,
        type: dto.type,
        file_name: file.originalname,
        file_path: relativePath,
        file_url: fileUrl,
        mime_type: file.mimetype,
        file_size: file.size.toString(),
        is_active: dto.is_active,
        is_thumbnail: dto.is_thumbnail || false,
        is_url: false,
      };
    } else {
      if (!dto.file_url) {
        throw new BadRequestException(trans('media.file_required') || 'Either a file upload or a file_url is required.');
      }

      createDto = {
        course_id: dto.course_id,
        type: dto.type,
        file_name: null,
        file_path: null,
        file_url: dto.file_url,
        mime_type: null,
        file_size: null,
        is_active: dto.is_active,
        is_thumbnail: dto.is_thumbnail || false,
        is_url: true,
      };
    }

    const [result, error] = await handlePromise(this.courseMediaService.add(createDto, userId));
    if (error) throw error;
    
    return {
      message: trans('media.created'),
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get course media by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the course media' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.courseMediaService.getById(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update course media metadata or file' })
  @ApiParam({ name: 'id', description: 'UUID of the course media' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', getMulterOptions('any', 'course-media')))
  async updateMedia(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCourseMediaDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user.id;

    // Build update payload dynamically
    const updatePayload: any = {
      course_id: dto.course_id,
      type: dto.type,
      is_active: dto.is_active,
    };

    // If a new file is uploaded, replace file details
    if (file) {
      const destIndex = file.destination.replace(/\\/g, '/').indexOf('uploads/');
      const relativePath = destIndex !== -1 ? file.destination.replace(/\\/g, '/').substring(destIndex) + '/' + file.filename : `uploads/files/${file.filename}`;
      const fileUrl = '/' + relativePath;
      updatePayload.file_name = file.originalname;
      updatePayload.file_path = relativePath;
      updatePayload.file_url = fileUrl;
      updatePayload.mime_type = file.mimetype;
      updatePayload.file_size = file.size.toString();
    }

    const [result, error] = await handlePromise(this.courseMediaService.update(id, updatePayload, userId));
    if (error) throw error;

    return {
      message: trans('media.updated'),
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete course media by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the course media' })
  async deleteMedia(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.courseMediaService.delete(id));
    if (error) throw error;
    return result;
  }

  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all media items for a specific course' })
  @ApiParam({ name: 'courseId', description: 'UUID of the course' })
  async getByCourseId(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Query() filterDto: CourseMediaFilterDto,
  ) {
    const [result, error] = await handlePromise(this.courseMediaService.getMediaByCourseId(courseId, filterDto));
    if (error) throw error;
    return result;
  }
}
