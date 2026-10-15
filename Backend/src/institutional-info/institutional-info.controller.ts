import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@/generated/prisma/enums';
import { Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { UpdateInstitutionalInfoDto } from './dto/update-institutional-info.dto';
import { InstitutionalInfoService } from './institutional-info.service';

@Controller('institutional-info')
export class InstitutionalInfoController {
  constructor(
    private readonly institutionalInfoService: InstitutionalInfoService,
  ) {}

  @Get()
  get() {
    return this.institutionalInfoService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateInstitutionalInfoDto) {
    return this.institutionalInfoService.update(dto);
  }
}
