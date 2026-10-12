import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { Role } from '@/generated/prisma/enums';
import { Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { imageStorage } from './image-storage';

@Controller('uploads')
export class UploadsController {
  // Admins upload for news / institutional info, business owners for their
  // activities. Everyone else must log in first.
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.NEGOCIO)
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
    return {
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    };
  }
}
