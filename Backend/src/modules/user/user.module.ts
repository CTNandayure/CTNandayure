import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserService } from './services';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
