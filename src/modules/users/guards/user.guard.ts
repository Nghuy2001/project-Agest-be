import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/modules/auth/types/auth.type';

@Injectable()
export class CandidateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.account) {
      throw new UnauthorizedException("You are not logged in!");
    }
    if (req.account.role !== UserRole.candidate) {
      throw new ForbiddenException("You do not have permission!");
    }
    return true;
  }
}