import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/modules/user/services/user.service';
import { MailService } from '@/modules/mail/services/mail.service';
import {
  CreateBusinessRequestDto,
  CreateBusinessDirectDto,
  UpdateBusinessDto,
  UpdateBusinessStatusDto,
  RejectRequestDto,
} from '../dtos';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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

    return { message: 'Solicitud rechazada y eliminada correctamente' };
  }

  async getBusinesses() {
    return (this.prisma as any).business.findMany({
      include: {
        request: true,
        user: {
          include: {
            person: true,
          },
        },
      },
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

  async getMyBusiness(userId: string) {
    const business = await (this.prisma as any).business.findUnique({
      where: { userId },
      include: { request: true, user: { include: { person: true } } },
    });
    if (!business) {
      throw new NotFoundException('No se encontró ningún negocio asociado a esta cuenta');
    }
    return business;
  }

  async updateMyBusiness(userId: string, dto: UpdateBusinessDto) {
    const business = await this.getMyBusiness(userId);
    return this.applyBusinessUpdate(business, dto);
  }

  async getBusinessById(id: string) {
    const business = await (this.prisma as any).business.findUnique({
      where: { id },
      include: { request: true, user: { include: { person: true } } },
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

  private async applyBusinessUpdate(business: any, dto: UpdateBusinessDto) {
    return (this.prisma as any).$transaction(async (tx: any) => {
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
        include: { request: true, user: { include: { person: true } } },
      });
    });
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

