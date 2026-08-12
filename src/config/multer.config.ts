import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Common configuration factory for Multer file uploads (images & videos).
 * Exposes storage path resolution, file type filters, and size limitations.
 */
export const getMulterOptions = (type: 'image' | 'video' | 'any', moduleName: string) => {
  return {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const subfolder = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'files';
        const uploadDir = join(process.cwd(), 'uploads', subfolder, moduleName);

        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = crypto.randomUUID();
        const fileExt = extname(file.originalname);
        callback(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req: any, file: any, callback: any) => {
      if (type === 'image') {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
        }
      } else if (type === 'video') {
        if (!file.mimetype.match(/\/(mp4|mkv|avi|webm|quicktime)$/)) {
          return callback(new BadRequestException('Only video files (mp4, mkv, avi, webm, mov) are allowed!'), false);
        }
      }
      callback(null, true);
    },
    limits: {
      // Limits: 2MB for images, 50MB for videos, 20MB default
      fileSize: type === 'image' ? 2 * 1024 * 1024 : type === 'video' ? 50 * 1024 * 1024 : 20 * 1024 * 1024,
    },
  };
};
