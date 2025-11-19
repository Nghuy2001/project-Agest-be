import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CandidateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.account) {
      throw new UnauthorizedException("You are not logged in!");
    }

    if (req.account.role !== "candidate") {
      throw new ForbiddenException("You do not have permission!");
    }

    return true;
  }
}