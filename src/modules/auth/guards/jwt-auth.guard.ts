import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma/prisma.service';
import type { Response } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  private async refreshAccessToken(payload: any, refreshToken: string, response: Response) {
    const user = await this.prisma.accountsUser.findUnique({ where: { id: payload.id } });
    if (user) {
      if (user.refreshToken !== refreshToken) {
        await this.prisma.accountsUser.update({ where: { id: payload.id }, data: { refreshToken: null } });
        throw new UnauthorizedException('Invalid refresh token! Please login again.');
      }
      const newAccessToken = await this.jwtService.signAsync({ id: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      return { id: user.id, email: user.email, role: user.role };
    }

    const company = await this.prisma.accountCompany.findUnique({ where: { id: payload.id } });
    if (company) {
      if (company.refreshToken !== refreshToken) {
        await this.prisma.accountCompany.update({ where: { id: payload.id }, data: { refreshToken: null } });
        throw new UnauthorizedException('Invalid refresh token! Please login again.');
      }
      const newAccessToken = await this.jwtService.signAsync({ id: company.id, email: company.email, role: company.role }, { expiresIn: '15m' });
      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      return { id: company.id, email: company.email, role: company.role };
    }

    throw new UnauthorizedException('Account not found!');
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
      } catch (err: any) {
        response.clearCookie('accessToken');
      }
    }
    if (!refreshToken) throw new UnauthorizedException('Access token expired. Please login again.');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Refresh token invalid or expired. Please login again.');
    }
    request.account = await this.refreshAccessToken(payload, refreshToken, response);
    return true;
  }
}