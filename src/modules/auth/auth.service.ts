import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { loginDto, registerCompanyDto, registerUserDto } from './dto/auth.dto';
import { UserRole } from './types/auth.type';
import { Account } from 'src/core/interfaces/account.interface';
import { GoogleUser } from '../../core/interfaces/google-user.interface'
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  private async generateTokens(payload: { id: string; email: string; role: string }) {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }
  async handleGoogleLogin(data: GoogleUser, role: UserRole) {
    if (!data?.providerId) {
      throw new BadRequestException('Invalid user data');
    }

    return this.prisma.$transaction(async (tx) => {

      let account;
      if (role === UserRole.employer) {
        const existingAccount = await tx.accountCompany.findUnique({
          where: { email: data.email },
        });

        if (existingAccount) {
          account = await tx.accountCompany.update({
            where: { id: existingAccount.id },
            data: {
              email: data.email,
              logo: data.avatar,
              provider: data.provider,
              providerId: data.providerId,
            },
          });
        } else {
          account = await tx.accountCompany.create({
            data: {
              companyName: data.name,
              email: data.email,
              logo: data.avatar,
              provider: data.provider,
              providerId: data.providerId,
              role,
            },
          });
        }
      } else {
        const existingAccount = await tx.accountsUser.findUnique({
          where: { email: data.email },
        });

        if (existingAccount) {
          account = await tx.accountsUser.update({
            where: { id: existingAccount.id },
            data: {
              email: data.email,
              avatar: data.avatar,
              provider: data.provider,
              providerId: data.providerId,
            },
          });
        } else {
          account = await tx.accountsUser.create({
            data: {
              fullName: data.name,
              email: data.email,
              avatar: data.avatar,
              provider: data.provider,
              providerId: data.providerId,
              role,
            },
          });
        }
      }

      const payload = { id: account.id, email: account.email, role };
      const { accessToken, refreshToken } = await this.generateTokens(payload);
      if (role === UserRole.employer) {
        await tx.accountCompany.update({
          where: { id: account.id },
          data: { refreshToken },
        });
      } else {
        await tx.accountsUser.update({
          where: { id: account.id },
          data: { refreshToken },
        });
      }

      return { accessToken, refreshToken };
    });
  }


  async clearOldTokensInDB(accountId: string, role: UserRole) {
    if (role === UserRole.candidate) {
      await this.prisma.accountsUser.update({
        where: { id: accountId },
        data: { refreshToken: null },
      });
    } else {
      await this.prisma.accountCompany.update({
        where: { id: accountId },
        data: { refreshToken: null },
      });
    }
  }
  async loginCompany(data: loginDto) {
    const { email, password } = data;
    const companyExists = await this.prisma.accountCompany.findUnique({
      where: { email },
    });

    if (!companyExists) throw new BadRequestException("Email does not exist!");
    if (companyExists.role !== UserRole.employer) throw new ForbiddenException("No permission");
    if (!companyExists.password) {
      throw new BadRequestException("This account is registered with Google, please sign in with Google!");
    }
    const isPasswordValid = await bcrypt.compare(password, companyExists.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

    const payload = { id: companyExists.id, email: companyExists.email, role: companyExists.role };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.prisma.accountCompany.update({
      where: { id: companyExists.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
  async loginUser(data: loginDto) {
    const { email, password } = data;

    const userExists = await this.prisma.accountsUser.findUnique({
      where: { email },
    });

    if (!userExists) throw new BadRequestException("Email does not exist!");
    if (userExists.role !== UserRole.candidate) throw new ForbiddenException("No permission");
    if (!userExists.password) {
      throw new BadRequestException("Password does not exist!");
    }
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

    const payload = { id: userExists.id, email: userExists.email, role: userExists.role };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.prisma.accountsUser.update({
      where: { id: userExists.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
  async registerCompany(data: registerCompanyDto) {
    const { companyName, email, password } = data
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (existsCompany) {
      throw new BadRequestException("Email already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.accountCompany.create({
      data: {
        email: email,
        password: hashedPassword,
        companyName: companyName,
        role: UserRole.employer
      },
    });

    return { message: "Registration successful!" };
  }
  async registerUser(data: registerUserDto) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    await this.prisma.accountsUser.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: UserRole.candidate
      },
    });

    return { message: "Registration successful!" };
  }
  async check(accountPayload: Account) {
    if (!accountPayload) throw new UnauthorizedException('Invalid Token!');
    const { id, role } = accountPayload;

    if (role === UserRole.candidate) {
      const user = await this.prisma.accountsUser.findUnique({
        where: { id },
        select: { id: true, fullName: true, email: true, avatar: true, phone: true },
      });
      if (!user) throw new UnauthorizedException('User not found');
      return { infoUser: user };
    } else {
      const company = await this.prisma.accountCompany.findUnique({
        where: { id },
        select: { id: true, companyName: true, email: true, cityId: true, address: true, companyModel: true, companyEmployees: true, workingTime: true, workOvertime: true, description: true, logo: true, phone: true },
      });
      if (!company) throw new UnauthorizedException('Company not found');
      return { infoCompany: company };
    }
  }

  async logoutFromDB(refreshToken: string) {
    if (!refreshToken) return;
    await this.prisma.accountCompany.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
    await this.prisma.accountsUser.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
  }
}
