import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class EmployerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.account) {
      throw new UnauthorizedException("Bạn chưa đăng nhập!");
    }

    if (req.account.role !== "employer") {
      throw new ForbiddenException("Bạn không có quyền!");
    }

    return true;
  }
}