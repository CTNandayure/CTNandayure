import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/modules/user/entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
