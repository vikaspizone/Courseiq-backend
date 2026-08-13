import { PartialType } from '@nestjs/swagger';
import { UploadCourseMediaDto } from './upload-course-media.dto';

export class UpdateCourseMediaDto extends PartialType(UploadCourseMediaDto) {}

