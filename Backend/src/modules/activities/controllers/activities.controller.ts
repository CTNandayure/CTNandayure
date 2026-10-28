import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@/generated/prisma/enums';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { UserEntity } from '@/modules/user/entities';
import {
  AdminListActivitiesQueryDto,
  CreateActivityAdminDto,
  CreateActivityDto,
  ListActivitiesQueryDto,
  UpdateActivityDto,
  UpdateActivityStatusDto,
} from '../dtos';
import { ActivitiesService } from '../services/activities.service';

// Route order matters: the literal "my" and "admin" routes are declared before
// the public ':slug' route so they are never read as a slug.
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ── Owner: a business manages only its own activities ──

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NEGOCIO)
  findMine(@CurrentUser() user: UserEntity) {
    return this.activitiesService.findMine(user.id_person);
  }

  @Post('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NEGOCIO)
  createMine(@CurrentUser() user: UserEntity, @Body() dto: CreateActivityDto) {
    return this.activitiesService.createMine(user.id_person, dto);
  }

  @Patch('my/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NEGOCIO)
  updateMine(@CurrentUser() user: UserEntity, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.updateMine(user.id_person, id, dto);
  }

  @Patch('my/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NEGOCIO)
  updateMineStatus(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateActivityStatusDto,
  ) {
    return this.activitiesService.updateMineStatus(user.id_person, id, dto.status);
  }

  // ── Admin: every activity, every status ──

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query() query: AdminListActivitiesQueryDto) {
    return this.activitiesService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOneAdmin(@Param('id') id: string) {
    return this.activitiesService.findOneAdmin(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createAdmin(@Body() dto: CreateActivityAdminDto) {
    return this.activitiesService.createAdmin(dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.updateAdmin(id, dto);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatusAdmin(@Param('id') id: string, @Body() dto: UpdateActivityStatusDto) {
    return this.activitiesService.updateStatusAdmin(id, dto.status);
  }

  // ── Public ──

  @Get()
  findPublic(@Query() query: ListActivitiesQueryDto) {
    return this.activitiesService.findPublic(query);
  }

  @Get(':slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.activitiesService.findPublicBySlug(slug);
  }
}
