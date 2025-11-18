import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.token;

    if (!token) throw new UnauthorizedException('Invalid Token!');

    try {
      const payload = this.jwtService.verify(token);
      request.account = payload;
      return true;
    } catch (error) {
      console.error("JWT Verify Error:", error);
      throw new UnauthorizedException('Token is invalid or expired!');
    }
  }
}
