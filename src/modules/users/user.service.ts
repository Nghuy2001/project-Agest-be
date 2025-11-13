import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  async register(data: RegisterDto) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        code: "error",
        message: "Email đã tồn tại!"
      }
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

    return {
      code: "success",
      message: "Đăng ký thành công!"
    }
  }

  async login(data: LoginDto, res: Response) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      return {
        code: "error",
        message: "Email không tồn tại trong hệ thống!"
      }
    }
    const isPasswordValid = await bcrypt.compare(data.password, `${existingUser.password}`);
    if (!isPasswordValid) {
      return {
        code: "error",
        message: "Mật khẩu không đúng!"
      }
    }
    const payload = { sub: existingUser.id, username: existingUser.email };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('jwt', token, {
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