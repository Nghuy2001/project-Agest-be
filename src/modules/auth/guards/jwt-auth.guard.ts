import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import type { Response } from 'express';
import { UserRole } from '../types/auth.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  private async clearRefreshToken(account: any) {
    if (account.role === UserRole.candidate) {
      await this.prisma.accountsUser.update({
        where: { id: account.id },
        data: { refreshToken: null },
      });
    } else if (account.role === UserRole.employer) {
      await this.prisma.accountCompany.update({
        where: { id: account.id },
        data: { refreshToken: null },
      });
    }
  }

  private async refreshAccessToken(payload: any, refreshToken: string, response: Response) {
    const account = await this.prisma.accountsUser.findUnique({ where: { id: payload.id } })
      || await this.prisma.accountCompany.findUnique({ where: { id: payload.id } });

    if (!account) throw new UnauthorizedException('Unauthorized');

    if (account.refreshToken !== refreshToken) {
      await this.clearRefreshToken(account);
      throw new UnauthorizedException('Invalid refresh token. Please login again.');
    }

    const newAccessToken = await this.jwtService.signAsync({ id: account.id, email: account.email, role: account.role }, { expiresIn: '15m' });

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { id: account.id, email: account.email, role: account.role };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies?.accessToken;
    const refreshToken = request.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    if (accessToken) {
      try {
        const payload = this.jwtService.verify(accessToken);
        request.account = payload;
        return true;
      } catch {
        response.clearCookie('accessToken');
      }
    }

    if (!refreshToken) throw new UnauthorizedException('Access token expired. Please login again.');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired. Please login again.');
    }

    request.account = await this.refreshAccessToken(payload, refreshToken, response);
    return true;
  }
}
