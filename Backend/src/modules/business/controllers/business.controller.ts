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
import { ThrottlerGuard } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { mkdirSync, promises as fs } from 'fs';
import { BusinessService } from '../services/business.service';
import { BUSINESS_UPLOADS_DIR } from '../services/business-files.service';
import {
  MIME_TO_KIND,
  detectFileKind,
  readFileHead,
} from '../utils/file-signature';
import { assertUploadedFromThisSite } from '../utils/uploaded-urls';
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
  async createRequest(
    @Body() dto: CreateBusinessRequestDto,
    @Req() req: Request,
  ) {
    assertUploadedFromThisSite(dto, req);
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

  // Public on purpose: the affiliation form uploads photos and documents before the
  // applicant has an account. So it is rate limited per IP (see BusinessModule), keeps
  // only the types in MIME_TO_KIND, and checks the file's real content, not just what
  // the client claims it is.
  @Post('upload')
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          mkdirSync(BUSINESS_UPLOADS_DIR, { recursive: true });
          cb(null, BUSINESS_UPLOADS_DIR);
        },
        // The extension comes from the accepted type, never from the client's file
        // name: a ".html" sent as an image must not be stored (and served) as HTML.
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `business-${uniqueSuffix}.${MIME_TO_KIND[file.mimetype]}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (MIME_TO_KIND[file.mimetype]) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Tipo de archivo no soportado. Use imágenes (JPG, PNG, WEBP, GIF), PDF o DOCX.',
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

    const kind = detectFileKind(await readFileHead(file.path));
    if (kind === null || kind !== MIME_TO_KIND[file.mimetype]) {
      await fs.unlink(file.path).catch(() => undefined);
      throw new BadRequestException(
        'El contenido del archivo no corresponde a una imagen, PDF o DOCX válido.',
      );
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
    assertUploadedFromThisSite(dto, req as Request);
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
    @Req() req: Request,
  ) {
    assertUploadedFromThisSite(dto, req);
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
  async createBusinessDirect(
    @Body() dto: CreateBusinessDirectDto,
    @Req() req: Request,
  ) {
    assertUploadedFromThisSite(dto, req);
    return this.businessService.createBusinessDirect(dto);
  }
}
