import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsStatus } from '@/generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { UpdateNewsStatusDto } from './dto/update-news-status.dto';
import { sanitizeNewsContent } from './utils/sanitize-content';
import { slugify } from './utils/slugify';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'noticia';
    let slug = base;
    let suffix = 2;
    while (await this.prisma.news.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix++;
    }
    return slug;
  }

  findPublished() {
    return this.prisma.news.findMany({
      where: { status: NewsStatus.PUBLICADO },
      orderBy: { publishedAt: 'desc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: NewsStatus.PUBLICADO },
    });
    if (!item) throw new NotFoundException('Noticia no encontrada');
    return item;
  }

  async findOneForAdmin(id: string) {
    const item = await this.prisma.news.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Noticia no encontrada');
    return item;
  }

  async create(dto: CreateNewsDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.news.create({
      data: {
        ...dto,
        content: sanitizeNewsContent(dto.content),
        slug,
        status: NewsStatus.BORRADOR,
      },
    });
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.findOneForAdmin(id);
    return this.prisma.news.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.content !== undefined ? { content: sanitizeNewsContent(dto.content) } : {}),
      },
    });
  }

  async updateStatus(id: string, dto: UpdateNewsStatusDto) {
    const existing = await this.findOneForAdmin(id);
    return this.prisma.news.update({
      where: { id },
      data: {
        status: dto.status,
        publishedAt:
          dto.status === NewsStatus.PUBLICADO ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    });
  }
}
