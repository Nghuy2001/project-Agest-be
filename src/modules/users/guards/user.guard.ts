import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CandidateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.account) {
      throw new UnauthorizedException("Bạn chưa đăng nhập!");
    }

    if (req.account.role !== "candidate") {
      throw new ForbiddenException("Bạn không có quyền!");
    }

    return true;
  }
}