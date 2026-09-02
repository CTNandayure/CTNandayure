import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { UpdateInstitutionalInfoDto } from './dto/update-institutional-info.dto';
import { InstitutionalInfoService } from './institutional-info.service';

@Controller('institutional-info')
export class InstitutionalInfoController {
  constructor(private readonly institutionalInfoService: InstitutionalInfoService) {}

  @Get()
  get() {
    return this.institutionalInfoService.get();
  }

  @Patch()
  @UseGuards(AdminAuthGuard)
  update(@Body() dto: UpdateInstitutionalInfoDto) {
    return this.institutionalInfoService.update(dto);
  }
}
