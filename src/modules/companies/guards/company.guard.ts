import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class EmployerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.account) {
      throw new UnauthorizedException("You are not logged in.");
    }
    if (req.account.role !== "employer") {
      throw new ForbiddenException("You do not have permission to access this resource.");
    }

    return true;
  }
}