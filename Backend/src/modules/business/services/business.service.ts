import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@/generated/prisma/client';
import { UserService } from '@/modules/user/services/user.service';
import { MailService } from '@/modules/mail/services/mail.service';
import {
  CreateBusinessRequestDto,
  CreateBusinessDirectDto,
  UpdateBusinessDto,
  UpdateBusinessStatusDto,
  RejectRequestDto,
} from '../dtos';
import { BusinessFilesService } from './business-files.service';

// What the owner and admin screens read about the account linked to a business.
// Never `include: { user: true }` here: that row also holds passwordHash.
const BUSINESS_INCLUDE = {
  request: true,
  user: {
    select: {
      email: true,
      person: {
        select: {
          name: true,
          first_lastname: true,
          second_lastname: true,
          phone: true,
        },
      },
    },
  },
} satisfies Prisma.BusinessInclude;

type BusinessWithAccount = Prisma.BusinessGetPayload<{
  include: typeof BUSINESS_INCLUDE;
}>;

// Businesses and affiliation requests keep their photos and documents the same way.
interface StoredFiles {
  coverImageUrl: string;
  galleryUrls: string[];
  documentUrls: string[];
}

const storedFileUrls = (row: StoredFiles) => [
  row.coverImageUrl,
  ...row.galleryUrls,
  ...row.documentUrls,
];

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly files: BusinessFilesService,
  ) {}

  async createRequest(dto: CreateBusinessRequestDto) {
    this.logger.debug('Creating business request');
    const request = await (this.prisma as any).businessRequest.create({
      data: {
        ...dto,
        requestStatus: 'PENDING',
      },
    });
    return request;
  }

  async getRequests(status: string = 'PENDING') {
    return (this.prisma as any).businessRequest.findMany({
      where: status ? { requestStatus: status } : { requestStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestById(id: string) {
    const request = await (this.prisma as any).businessRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return request;
  }

  async approveRequest(id: string) {
    this.logger.debug(`Approving request ${id}`);
    return (this.prisma as any).$transaction(async (tx: any) => {
      const request = await tx.businessRequest.findUnique({ where: { id } });
      if (!request) {
        throw new NotFoundException('Solicitud no encontrada');
      }
      if (request.requestStatus !== 'PENDING') {
        throw new BadRequestException('La solicitud no está pendiente');
      }

      const updatedRequest = await tx.businessRequest.update({
        where: { id },
        data: { requestStatus: 'APPROVED' },
      });

      const {
        applicantName,
        applicantFirstLastname,
        applicantSecondLastname,
        applicantPhone,
        applicantEmail,
        requestStatus,
        rejectionReason,
        createdAt,
        updatedAt,
        id: reqId,
        ...businessData
      } = updatedRequest;
      const user = await this.userService.createUser({
        name: applicantName,
        first_lastname: applicantFirstLastname,
        second_lastname: applicantSecondLastname,
        phone: applicantPhone,
        email: applicantEmail,
        role: 'NEGOCIO',
      });

      const business = await tx.business.create({
        data: {
          ...businessData,
          businessStatus: 'ACTIVE',
          requestId: id,
          userId: user.id_person,
        },
      });

      return business;
    });
  }

  async rejectRequest(id: string, dto: RejectRequestDto) {
    this.logger.debug(`Rejecting and deleting request ${id}`);
    const request = await this.getRequestById(id);
    if (request.requestStatus !== 'PENDING') {
      throw new BadRequestException('La solicitud no está pendiente');
    }
    await this.mailService.sendRejectionEmail(
      request.applicantEmail,
      request.businessName,
      dto.reason,
    );
    await (this.prisma as any).businessRequest.delete({
      where: { id },
    });
    // The rejected applicant's photos and legal documents have no owner left.
    await this.files.removeUnreferenced(storedFileUrls(request as StoredFiles));

    return { message: 'Solicitud rechazada y eliminada correctamente' };
  }

  async getBusinesses() {
    return this.prisma.business.findMany({
      include: BUSINESS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicBusinesses() {
    return (this.prisma as any).business.findMany({
      where: { businessStatus: 'ACTIVE' },
      select: {
        id: true,
        businessName: true,
        categories: true,
        district: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        facebookUrl: true,
        instagramUrl: true,
        scheduleText: true,
        coverImageUrl: true,
        galleryUrls: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // One account owns one business (Business.userId is unique), so the account in the
  // token is the only thing that decides which business is read or changed here.
  async getMyBusiness(userId: string): Promise<BusinessWithAccount> {
    const business = await this.prisma.business.findUnique({
      where: { userId },
      include: BUSINESS_INCLUDE,
    });
    if (!business) {
      throw new NotFoundException('No se encontró ningún negocio asociado a esta cuenta');
    }
    return business;
  }

  async updateMyBusiness(userId: string, dto: UpdateBusinessDto) {
    const business = await this.getMyBusiness(userId);
    // A deactivated business can still be looked at, but only the Cámara can
    // change it (admin edits go through updateBusiness).
    if (business.businessStatus !== 'ACTIVE') {
      throw new ForbiddenException(
        'Su negocio está inactivo. Comuníquese con la Cámara para reactivarlo.',
      );
    }
    return this.applyBusinessUpdate(business, dto);
  }

  async getBusinessById(id: string): Promise<BusinessWithAccount> {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: BUSINESS_INCLUDE,
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }
    return business;
  }

  async updateBusiness(id: string, dto: UpdateBusinessDto) {
    const business = await this.getBusinessById(id);
    return this.applyBusinessUpdate(business, dto);
  }

  private async applyBusinessUpdate(
    business: BusinessWithAccount,
    dto: UpdateBusinessDto,
  ) {
    const updated = await (this.prisma as any).$transaction(async (tx: any) => {
      const {
        applicantName,
        applicantFirstLastname,
        applicantSecondLastname,
        applicantPhone,
        ...businessFields
      } = dto;

      await tx.business.update({
        where: { id: business.id },
        data: businessFields,
      });

      const personData: Record<string, string> = {};
      if (applicantName !== undefined && applicantName.trim() !== '') {
        personData.name = applicantName.trim();
      }
      if (applicantFirstLastname !== undefined && applicantFirstLastname.trim() !== '') {
        personData.first_lastname = applicantFirstLastname.trim();
      }
      if (applicantSecondLastname !== undefined && applicantSecondLastname.trim() !== '') {
        personData.second_lastname = applicantSecondLastname.trim();
      }
      if (applicantPhone !== undefined && applicantPhone.trim() !== '') {
        personData.phone = applicantPhone.trim();
      }

      if (Object.keys(personData).length > 0) {
        if (business.userId) {
          const user = await tx.user.findUnique({
            where: { id_person: business.userId },
          });
          if (user?.personId) {
            await tx.person.update({
              where: { id_person: user.personId },
              data: personData,
            });
          }
        }

        if (business.requestId) {
          const requestData: Record<string, string> = {};
          if (personData.name) requestData.applicantName = personData.name;
          if (personData.first_lastname) requestData.applicantFirstLastname = personData.first_lastname;
          if (personData.second_lastname) requestData.applicantSecondLastname = personData.second_lastname;
          if (personData.phone) requestData.applicantPhone = personData.phone;

          if (Object.keys(requestData).length > 0) {
            await tx.businessRequest.update({
              where: { id: business.requestId },
              data: requestData,
            });
          }
        }
      }

      return tx.business.findUnique({
        where: { id: business.id },
        include: BUSINESS_INCLUDE,
      });
    });

    // Photos and documents the update replaced or removed are no longer needed.
    await this.files.removeUnreferenced(storedFileUrls(business));

    return updated;
  }

  async updateBusinessStatus(id: string, dto: UpdateBusinessStatusDto) {
    await this.getBusinessById(id);
    return (this.prisma as any).business.update({
      where: { id },
      data: { businessStatus: dto.businessStatus },
    });
  }

  async createBusinessDirect(dto: CreateBusinessDirectDto) {
    this.logger.debug('Creating business directly');
    return (this.prisma as any).$transaction(async (tx: any) => {
      const {
        applicantName,
        applicantFirstLastname,
        applicantSecondLastname,
        applicantPhone,
        applicantEmail,
        ...businessData
      } = dto;
      const user = await this.userService.createUser({
        name: applicantName,
        first_lastname: applicantFirstLastname,
        second_lastname: applicantSecondLastname,
        phone: applicantPhone,
        email: applicantEmail,
        role: 'NEGOCIO',
      });

      const business = await tx.business.create({
        data: {
          ...businessData,
          businessStatus: 'ACTIVE',
          userId: user.id_person,
        },
      });

      return business;
    });
  }
}

