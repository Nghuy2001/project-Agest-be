import { Injectable } from '@nestjs/common';
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
      return {
        code: "error",
        message: "Email đã tồn tại!"
      }
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

    return {
      code: "success",
      message: "Đăng ký tài khoản thành công!"
    }
  }
  async login(data: LoginDto, res: Response) {
    const { email, password } = data;
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (!existsCompany) {
      return {
        code: "error",
        message: "Email không tồn tại trong hệ thống!"
      }
    }
    const isPasswordValid = await bcrypt.compare(password, `${existsCompany.password}`);
    if (!isPasswordValid) {
      return {
        code: "error",
        message: "Mật khẩu không đúng!"
      }
    }
    const payload = { sub: existsCompany.id, email: existsCompany.email };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });
    return {
      code: "success",
      message: "Đăng nhập thành công!",
    }
  }
}