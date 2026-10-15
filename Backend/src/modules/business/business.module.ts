import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/modules/user/user.module';
import { MailModule } from '@/modules/mail/mail.module';
import { BusinessController } from './controllers/business.controller';
import { BusinessService } from './services/business.service';
import { BusinessFilesService } from './services/business-files.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    MailModule,
    // Limit for the public POST /businesses/upload: a full affiliation form sends
    // about a dozen files, so 30 a minute per IP is generous for a person and
    // short of what a script needs to fill the disk.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 30 }],
      errorMessage:
        'Demasiadas subidas seguidas. Espere un minuto e intente de nuevo.',
    }),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessFilesService],
  exports: [BusinessService],
})
export class BusinessModule {}
