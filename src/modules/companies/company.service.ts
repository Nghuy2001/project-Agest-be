import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/company.dto';
import bcrypt from "bcryptjs";
import { Response } from 'express';
@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  async register(data: RegisterDto) {
    const { companyName, email, password } = data
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (existsCompany) {
      throw new BadRequestException("Email đã tồn tại!");
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

    return { message: "Đăng ký thành công!" };
  }
  async login(data: LoginDto, res: Response) {
    const { email, password } = data;
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (!existsCompany) {
      throw new BadRequestException("Email không tồn tại!");
    }
    const isPasswordValid = await bcrypt.compare(password, `${existsCompany.password}`);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mật khẩu không đúng!");
    }
    const payload = { id: existsCompany.id, email: existsCompany.email, role: existsCompany.role };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });
    return { message: "Đăng nhập thành công!" };
  }

  async updateProfile(body: any, id: any, logoUrl?: string) {
    try {
      if (logoUrl) {
        body.logo = logoUrl;
      }

      for (const key in body) {
        if (body[key] === '') {
          body[key] = null;
        }
      }
      await this.prisma.accountCompany.update({
        where: { id: id },
        data: body,
      });
      console.log(body)
      return {
        code: "success",
        message: "Cập nhật thành công!"
      };
    } catch (error) {
      throw new BadRequestException("Không thể cập nhật hồ sơ!");
    }
  }
}