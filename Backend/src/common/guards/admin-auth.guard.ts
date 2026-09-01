import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// Placeholder until the auth/users module lands — always allows the request
// through. Swap the body of canActivate() for real session/JWT checks; no
// controller using this guard needs to change.
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
