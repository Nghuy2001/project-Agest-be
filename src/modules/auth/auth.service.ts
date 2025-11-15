import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }

  async check(accountPayload: any) {
    if (!accountPayload) {
      throw new UnauthorizedException('Token không hợp lệ!');
    }

    const id = accountPayload.id;
    const user = await this.prisma.accountsUser.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        phone: true
      },
    });

    if (user) {
      return {
        infoUser: user,
      };
    }
    const company = await this.prisma.accountCompany.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        email: true,
        cityId: true,
        address: true,
        companyModel: true,
        companyEmployees: true,
        workingTime: true,
        workOvertime: true,
        description: true,
        logo: true,
        phone: true
      },
    });

    if (company) {
      return {
        infoCompany: company,
      };
    }

    throw new UnauthorizedException('Token không hợp lệ!');
  }

  async logout(res: any) {
    res.clearCookie('token');
    return {
      code: "success",
      message: 'Đã đăng xuất!',
    };
  }
}
