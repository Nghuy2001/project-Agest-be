import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Response, Request } from 'express';
import { LoginDto, RegisterCompanyDto, RegisterUserDto } from './dto/auth.dto';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  private async createTokensAndSetCookies(payload: any, res: Response) {
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, refreshToken };
  }
  async loginCompany(data: LoginDto, res: Response) {
    const { email, password } = data;
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (!existsCompany) {
      throw new BadRequestException("Email does not exist!");
    }
    if (existsCompany.role !== "employer") {
      throw new ForbiddenException("You do not have permission to log in here!");
    }

    const isPasswordValid = await bcrypt.compare(password, `${existsCompany.password}`);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect password!");
    }
    const payload = { id: existsCompany.id, email: existsCompany.email, role: existsCompany.role };
    const tokens = await this.createTokensAndSetCookies(payload, res);
    await this.prisma.accountCompany.update({
      where: { id: existsCompany.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return { message: "Login successful!" };
  }
  async registerCompany(data: RegisterCompanyDto) {
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
      },
    });

    return { message: "Registration successful!" };
  }

  async loginUser(data: LoginDto, res: Response) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new BadRequestException("Email does not exist!");
    }
    if (existingUser.role !== "candidate") {
      throw new ForbiddenException("You do not have permission to log in here!");
    }

    const isPasswordValid = await bcrypt.compare(data.password, `${existingUser.password}`);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect password!");
    }
    const payload = { id: existingUser.id, email: existingUser.email, role: existingUser.role };
    const tokens = await this.createTokensAndSetCookies(payload, res);
    await this.prisma.accountsUser.update({
      where: { id: existingUser.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return { message: "Login successful!" };
  }

  async registerUser(data: RegisterUserDto) {
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
      },
    });

    return { message: "Registration successful!" };
  }

  async check(accountPayload: any) {
    if (!accountPayload) {
      throw new UnauthorizedException('Invalid Token!');
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

    if (user) return { infoUser: user };
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
    if (company) return { infoCompany: company };

    throw new UnauthorizedException('Invalid Token!');
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies['refreshToken'];
    if (token) {
      await this.prisma.accountCompany.updateMany({
        where: { refreshToken: token },
        data: { refreshToken: null },
      });

      await this.prisma.accountsUser.updateMany({
        where: { refreshToken: token },
        data: { refreshToken: null },
      });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return {
      code: "success",
      message: 'Signed out!',
    };
  }
}
