import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { ActivityStatus, BusinessStatus } from '@/generated/prisma/enums';
import { slugify } from '@/news/utils/slugify';
import { PrismaService } from '@/prisma/prisma.service';
import {
  AdminListActivitiesQueryDto,
  CreateActivityAdminDto,
  CreateActivityDto,
  ListActivitiesQueryDto,
  UpdateActivityDto,
} from '../dtos';
import type { ActivityResponse } from '../entities/activity-response';
import {
  mergeFields,
  normalizeFields,
  scheduleChanged,
  validateFields,
  validatePublishable,
  type ActivityFields,
  type ActivityFieldsPatch,
} from '../utils/activity-fields';
import {
  computeNextOccurrence,
  fromDateOnly,
  toDateOnly,
  todayInCostaRica,
} from '../utils/activity-schedule';

const BUSINESS_SUMMARY_SELECT = {
  id: true,
  businessName: true,
  district: true,
  categories: true,
  phone: true,
  email: true,
  coverImageUrl: true,
  facebookUrl: true,
  instagramUrl: true,
  businessStatus: true,
} satisfies Prisma.BusinessSelect;

const ACTIVITY_INCLUDE = {
  business: { select: BUSINESS_SUMMARY_SELECT },
} satisfies Prisma.ActivityInclude;

type ActivityRow = Prisma.ActivityGetPayload<{ include: typeof ACTIVITY_INCLUDE }>;

// Fields a client may set; anything else on a DTO (e.g. businessId) is ignored here.
const FIELD_KEYS = [
  'name',
  'description',
  'category',
  'customCategory',
  'durationMinutes',
  'requirements',
  'scheduleType',
  'startDate',
  'endDate',
  'daysOfWeek',
  'startTime',
  'meetingPoint',
  'meetingLatitude',
  'meetingLongitude',
  'imageUrl',
] as const satisfies ReadonlyArray<keyof ActivityFields>;

// "my" and "admin" are routes of the activities controller, never slugs.
const RESERVED_SLUGS = new Set(['my', 'admin']);

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────── public ─────────────────────────

  /** Published activities of active businesses that have not ended, soonest first. */
  async findPublic(query: ListActivitiesQueryDto): Promise<ActivityResponse[]> {
    const today = todayInCostaRica();
    const search = query.q?.trim();

    const rows = await this.prisma.activity.findMany({
      where: {
        status: ActivityStatus.PUBLICADA,
        business: {
          businessStatus: BusinessStatus.ACTIVE,
          ...(query.district ? { district: query.district } : {}),
        },
        ...(query.category ? { category: query.category } : {}),
        ...(query.businessId ? { businessId: query.businessId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { customCategory: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: ACTIVITY_INCLUDE,
    });

    const upcoming = rows
      .map((row) => this.toResponse(row, today))
      .filter((activity) => !activity.expired)
      .sort(
        (a, b) =>
          (a.nextOccurrence as string).localeCompare(b.nextOccurrence as string) ||
          a.startTime.localeCompare(b.startTime) ||
          a.name.localeCompare(b.name, 'es'),
      );

    return query.limit ? upcoming.slice(0, query.limit) : upcoming;
  }

  async findPublicBySlug(slug: string): Promise<ActivityResponse> {
    const row = await this.prisma.activity.findFirst({
      where: {
        slug,
        status: ActivityStatus.PUBLICADA,
        business: { businessStatus: BusinessStatus.ACTIVE },
      },
      include: ACTIVITY_INCLUDE,
    });
    const activity = row ? this.toResponse(row, todayInCostaRica()) : null;
    if (!activity || activity.expired) {
      throw new NotFoundException('Actividad no encontrada');
    }
    return activity;
  }

  // ───────────────────── owner (role NEGOCIO) ─────────────────────

  async findMine(userId: string): Promise<ActivityResponse[]> {
    const business = await this.getOwnerBusiness(userId);
    const today = todayInCostaRica();
    const rows = await this.prisma.activity.findMany({
      where: { businessId: business.id },
      include: ACTIVITY_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toResponse(row, today));
  }

  async createMine(userId: string, dto: CreateActivityDto): Promise<ActivityResponse> {
    const business = await this.getOwnerBusiness(userId);
    this.assertBusinessActive(business.businessStatus);
    return this.createFor(business.id, dto);
  }

  async updateMine(userId: string, id: string, dto: UpdateActivityDto): Promise<ActivityResponse> {
    const business = await this.getOwnerBusiness(userId);
    this.assertBusinessActive(business.businessStatus);
    const row = await this.getRow(id, business.id);
    return this.updateRow(row, dto);
  }

  async updateMineStatus(userId: string, id: string, status: ActivityStatus): Promise<ActivityResponse> {
    const business = await this.getOwnerBusiness(userId);
    this.assertBusinessActive(business.businessStatus);
    const row = await this.getRow(id, business.id);

    if (status === ActivityStatus.INACTIVA) {
      throw new ForbiddenException('Solo la Cámara puede desactivar una actividad');
    }
    if (row.status === ActivityStatus.INACTIVA) {
      throw new ForbiddenException(
        'Esta actividad fue desactivada por la Cámara. Comuníquese con la administración para reactivarla.',
      );
    }
    return this.changeStatus(row, status);
  }

  // ───────────────────────── admin ─────────────────────────

  async findAllAdmin(query: AdminListActivitiesQueryDto): Promise<ActivityResponse[]> {
    const today = todayInCostaRica();
    const search = query.q?.trim();

    const rows = await this.prisma.activity.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.businessId ? { businessId: query.businessId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { business: { businessName: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: ACTIVITY_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toResponse(row, today));
  }

  async findOneAdmin(id: string): Promise<ActivityResponse> {
    return this.toResponse(await this.getRow(id), todayInCostaRica());
  }

  async createAdmin(dto: CreateActivityAdminDto): Promise<ActivityResponse> {
    const business = await this.prisma.business.findUnique({ where: { id: dto.businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');
    return this.createFor(business.id, dto);
  }

  async updateAdmin(id: string, dto: UpdateActivityDto): Promise<ActivityResponse> {
    return this.updateRow(await this.getRow(id), dto);
  }

  async updateStatusAdmin(id: string, status: ActivityStatus): Promise<ActivityResponse> {
    return this.changeStatus(await this.getRow(id), status);
  }

  // ───────────────────────── internals ─────────────────────────

  private async getOwnerBusiness(userId: string) {
    const business = await this.prisma.business.findUnique({ where: { userId } });
    if (!business) {
      throw new NotFoundException('No se encontró ningún negocio asociado a esta cuenta');
    }
    return business;
  }

  private assertBusinessActive(status: BusinessStatus) {
    if (status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('Su negocio está inactivo. Comuníquese con la Cámara para reactivarlo.');
    }
  }

  /** Loads an activity; with businessId it also checks the activity belongs to it. */
  private async getRow(id: string, businessId?: string): Promise<ActivityRow> {
    const row = await this.prisma.activity.findFirst({
      where: { id, ...(businessId ? { businessId } : {}) },
      include: ACTIVITY_INCLUDE,
    });
    if (!row) throw new NotFoundException('Actividad no encontrada');
    return row;
  }

  private async createFor(businessId: string, dto: CreateActivityDto): Promise<ActivityResponse> {
    const today = todayInCostaRica();
    const fields = normalizeFields(mergeFields(null, this.toPatch(dto)));
    this.assertValid(validateFields(fields, { today, requireFuture: true }));

    const slug = await this.generateUniqueSlug(fields.name);
    const created = await this.prisma.activity.create({
      data: { ...this.toPersistence(fields), slug, businessId },
      include: ACTIVITY_INCLUDE,
    });
    return this.toResponse(created, today);
  }

  private async updateRow(row: ActivityRow, dto: UpdateActivityDto): Promise<ActivityResponse> {
    const today = todayInCostaRica();
    const before = this.toFields(row);
    const after = normalizeFields(mergeFields(before, this.toPatch(dto)));

    // "Not in the past" only applies when the schedule itself is being edited, so
    // fixing a typo in an old activity is never blocked by its date.
    const errors = validateFields(after, { today, requireFuture: scheduleChanged(before, after) });
    if (row.status === ActivityStatus.PUBLICADA && !after.imageUrl) {
      errors.unshift('No puede quitar la foto de una actividad publicada; despublíquela primero');
    }
    this.assertValid(errors);

    const updated = await this.prisma.activity.update({
      where: { id: row.id },
      data: this.toPersistence(after),
      include: ACTIVITY_INCLUDE,
    });
    return this.toResponse(updated, today);
  }

  private async changeStatus(row: ActivityRow, status: ActivityStatus): Promise<ActivityResponse> {
    const today = todayInCostaRica();
    if (row.status === status) return this.toResponse(row, today);

    if (status === ActivityStatus.PUBLICADA) {
      this.assertValid(validatePublishable(this.toFields(row), today));
    }

    const updated = await this.prisma.activity.update({
      where: { id: row.id },
      data: {
        status,
        ...(status === ActivityStatus.PUBLICADA && !row.publishedAt ? { publishedAt: new Date() } : {}),
      },
      include: ACTIVITY_INCLUDE,
    });
    return this.toResponse(updated, today);
  }

  private assertValid(errors: string[]) {
    if (errors.length > 0) throw new BadRequestException(errors);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'actividad';
    let slug = base;
    let suffix = 2;
    while (RESERVED_SLUGS.has(slug) || (await this.prisma.activity.findUnique({ where: { slug } }))) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }

  private toPatch(dto: CreateActivityDto | UpdateActivityDto): ActivityFieldsPatch {
    const patch: Record<string, unknown> = {};
    for (const key of FIELD_KEYS) {
      if (dto[key] !== undefined) patch[key] = dto[key];
    }
    return patch as ActivityFieldsPatch;
  }

  private toFields(row: ActivityRow): ActivityFields {
    return {
      name: row.name,
      description: row.description,
      category: row.category,
      customCategory: row.customCategory,
      durationMinutes: row.durationMinutes,
      requirements: row.requirements,
      scheduleType: row.scheduleType,
      startDate: fromDateOnly(row.startDate),
      endDate: fromDateOnly(row.endDate),
      daysOfWeek: row.daysOfWeek,
      startTime: row.startTime,
      meetingPoint: row.meetingPoint,
      meetingLatitude: row.meetingLatitude,
      meetingLongitude: row.meetingLongitude,
      imageUrl: row.imageUrl,
    };
  }

  private toPersistence(fields: ActivityFields) {
    return {
      ...fields,
      startDate: toDateOnly(fields.startDate),
      endDate: toDateOnly(fields.endDate),
    };
  }

  private toResponse(row: ActivityRow, today: string): ActivityResponse {
    const fields = this.toFields(row);
    const nextOccurrence = computeNextOccurrence(fields, today);
    return {
      id: row.id,
      slug: row.slug,
      ...fields,
      status: row.status,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nextOccurrence,
      expired: nextOccurrence === null,
      business: row.business,
    };
  }
}
