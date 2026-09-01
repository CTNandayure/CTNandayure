import { Module } from '@nestjs/common';
import { InstitutionalInfoController } from './institutional-info.controller';
import { InstitutionalInfoService } from './institutional-info.service';

@Module({
  controllers: [InstitutionalInfoController],
  providers: [InstitutionalInfoService],
})
export class InstitutionalInfoModule {}
