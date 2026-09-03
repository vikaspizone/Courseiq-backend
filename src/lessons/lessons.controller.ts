import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { handlePromise, cleanUndefined } from '../utils/async-handler';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { getMulterOptions } from '../config/multer.config';
import * as fs from 'fs';

function processMediaUploads(
  metadata: any[],
  uploadedFiles: Express.Multer.File[]
): any[] {
  const processed: any[] = [];
  let fileIndex = 0;

  if (!metadata || metadata.length === 0) {
    return processed;
  }

  for (let i = 0; i < metadata.length; i++) {
    const item = metadata[i];
    const isThumbnail = item.is_thumbnail === true || (item.is_thumbnail as any) === 'true';
    const isUrl = item.is_url === true || (item.is_url as any) === 'true';
    const type = item.type;
    const sortOrder = item.sort_order ? Number(item.sort_order) : i + 1;

    if (isUrl) {
      if (!item.file_url) {
        throw new BadRequestException(`file_url is required for metadata item at index ${i} when is_url is true`);
      }
      processed.push({
        file_url: item.file_url,
        is_url: true,
        is_thumbnail: isThumbnail,
        type,
        sort_order: sortOrder,
      });
    } else {
      // Must take file from uploadedFiles
      if (!uploadedFiles || fileIndex >= uploadedFiles.length) {
        throw new BadRequestException(`No uploaded file found matching the metadata item at index ${i} (expected file upload because is_url is false)`);
      }
      const file = uploadedFiles[fileIndex];
      fileIndex++;

      // Size validation
      let limit = 20 * 1024 * 1024; // 20MB default
      if (file.mimetype.startsWith('image/')) {
        limit = 2 * 1024 * 1024; // 2MB image limit
      } else if (file.mimetype.startsWith('video/')) {
        limit = 50 * 1024 * 1024; // 50MB video limit
      }

      if (file.size > limit) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds the size limit. (Limit: ${limit / (1024 * 1024)}MB)`
        );
      }

      const destIndex = file.destination.replace(/\\/g, '/').indexOf('uploads/');
      const relativePath = destIndex !== -1 ? file.destination.replace(/\\/g, '/').substring(destIndex) + '/' + file.filename : `uploads/files/${file.filename}`;
      const fileUrl = '/' + relativePath;

      processed.push({
        file_name: file.originalname,
        file_path: relativePath,
        file_url: fileUrl,
        mime_type: file.mimetype,
        file_size: file.size.toString(),
        is_url: false,
        is_thumbnail: isThumbnail,
        type,
        sort_order: sortOrder,
      });
    }
  }

  return processed;
}

@ApiTags('Lessons')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lesson with translations and media files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('mediaFiles', 10, getMulterOptions('any', 'lessons')),
  )
  async create(
    @Body() createDto: CreateLessonDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.id;

    try {
      if (createDto.media && createDto.media.length > 0) {
        (createDto as any).processedMedia = processMediaUploads(createDto.media, files || []);
      }
    } catch (error) {
      if (files && files.length > 0) {
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch {}
          }
        }
      }
      throw error;
    }

    const [result, error] = await handlePromise(this.lessonsService.create(createDto, userId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all lessons (localized)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'course_id', required: false, type: String, description: 'Filter by Course UUID' })
  @ApiQuery({ name: 'section_id', required: false, type: String, description: 'Filter by Course Section UUID' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by Lesson Type (video, text, document, quiz)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('course_id') course_id?: string,
    @Query('section_id') section_id?: string,
    @Query('type') type?: string,
  ) {
    const [result, error] = await handlePromise(
      this.lessonsService.findAll({ page, limit, search, course_id, section_id, type }),
    );
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a lesson by ID (localized + translations)' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.lessonsService.findOneLocalized(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a lesson and its translations/media' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('mediaFiles', 10, getMulterOptions('any', 'lessons')),
  )
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateLessonDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.id;

    try {
      if (updateDto.media !== undefined) {
        const hasUploads = updateDto.media.some(item => !(item.is_url === true || (item.is_url as any) === 'true'));
        const filesUploaded = files && files.length > 0;

        if (hasUploads && !filesUploaded) {
          (updateDto as any).processedMedia = undefined;
        } else {
          if (updateDto.media && updateDto.media.length > 0) {
            (updateDto as any).processedMedia = processMediaUploads(updateDto.media, files || []);
          } else {
            (updateDto as any).processedMedia = [];
          }
        }
      }
    } catch (error) {
      if (files && files.length > 0) {
        for (const file of files) {
          if (fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch {}
          }
        }
      }
      throw error;
    }

    const cleanedDto = cleanUndefined(updateDto);
    const [result, error] = await handlePromise(this.lessonsService.update(id, cleanedDto, userId));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a lesson by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the lesson' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.lessonsService.remove(id));
    if (error) throw error;
    return result;
  }
}
