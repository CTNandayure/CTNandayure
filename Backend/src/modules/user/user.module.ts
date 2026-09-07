import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserService } from './services';
import { PrismaModule } from '@/prisma/prisma.module';
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
