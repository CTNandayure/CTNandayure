import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { BusinessService } from '../services/business.service';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import {
  CreateBusinessRequestDto,
  CreateBusinessDirectDto,
  UpdateBusinessDto,
  UpdateBusinessStatusDto,
  RejectRequestDto,
} from '../dtos';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('requests')
  async createRequest(@Body() dto: CreateBusinessRequestDto) {
    return this.businessService.createRequest(dto);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRequests(@Query('status') status?: string) {
    return this.businessService.getRequests(status);
  }

  @Get('requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRequestById(@Param('id') id: string) {
    return this.businessService.getRequestById(id);
  }

  @Patch('requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveRequest(@Param('id') id: string) {
    return this.businessService.approveRequest(id);
  }

  @Patch('requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async rejectRequest(@Param('id') id: string, @Body() dto: RejectRequestDto) {
    return this.businessService.rejectRequest(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getBusinesses() {
    return this.businessService.getBusinesses();
  }

  @Get('public')
  async getPublicBusinesses() {
    return this.businessService.getPublicBusinesses();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './uploads/businesses';
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `business-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
          'image/gif',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Tipo de archivo no soportado. Use imágenes, PDF o DOCX.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return {
      url: `${req.protocol}://${req.get('host')}/uploads/businesses/${file.filename}`,
    };
  }

    @Get('my-business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NEGOCIO', 'ADMIN')
  async getMyBusiness(@Req() req: any) {
    return this.businessService.getMyBusiness(req.user.id_person);
  }

  @Patch('my-business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NEGOCIO', 'ADMIN')
  async updateMyBusiness(
    @Req() req: any,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateMyBusiness(req.user.id_person, dto);
  }

@Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getBusinessById(@Param('id') id: string) {
    return this.businessService.getBusinessById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBusiness(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateBusiness(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBusinessStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessStatusDto,
  ) {
    return this.businessService.updateBusinessStatus(id, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBusinessDirect(@Body() dto: CreateBusinessDirectDto) {
    return this.businessService.createBusinessDirect(dto);
  }
}
