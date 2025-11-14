import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
  ) { }
  async check(req: any) {
    try {
      const userPayload = req.user;

      if (!userPayload) {
        throw new UnauthorizedException('Token không hợp lệ!');
      }
      const existAccount = await this.prisma.accountsUser.findUnique({
        where: {
          id: userPayload.sub,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      });
      if (!existAccount) {
        throw new UnauthorizedException('Token không hợp lệ!');
      }

      return {
        code: "success",
        message: "Token hợp lệ!",
        infoUser: {
          id: existAccount.id,
          fullName: existAccount.fullName,
          email: existAccount.email,
        }
      };

    } catch (error) {
      return { code: 'error', message: 'Lỗi server!' };
    }
  }
  async logout(res: any) {
    res.clearCookie('jwt');
    return {
      code: "success",
      message: "Đã đăng xuất!"
    }
  }
}