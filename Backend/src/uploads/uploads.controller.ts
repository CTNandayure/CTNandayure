import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { imageStorage } from './image-storage';

@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Solo se permiten imágenes'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return { url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}` };
  }
}
