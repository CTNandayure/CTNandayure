import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/modules/user/user.module';
import { MailModule } from '@/modules/mail/mail.module';
import { BusinessController } from './controllers/business.controller';
import { BusinessService } from './services/business.service';

@Module({
  imports: [PrismaModule, UserModule, MailModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
