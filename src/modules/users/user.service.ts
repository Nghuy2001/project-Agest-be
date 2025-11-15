import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
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
      throw new BadRequestException("Email đã tồn tại!");
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

    return { message: "Đăng ký thành công!" };
  }

  async login(data: LoginDto, res: Response) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new BadRequestException("Email không tồn tại!");
    }
    const isPasswordValid = await bcrypt.compare(data.password, `${existingUser.password}`);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Mật khẩu không đúng!");
    }
    const payload = { id: existingUser.id, username: existingUser.email, role: existingUser.role };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });
    return { message: "Đăng nhập thành công!" };
  }
  async updateProfile(body: any, account: any, avatarUrl?: string) {
    try {
      if (avatarUrl) body.avatar = avatarUrl;
      else {
        delete body.avatar;
      }
      for (const key in body) {
        if (body[key] === '') {
          body[key] = null;
        }
      }
      if (body.email) {
        const existEmail = await this.prisma.accountsUser.findFirst({
          where: {
            email: body.email,
            NOT: { id: account.id }
          }
        });

        if (existEmail) {
          throw new BadRequestException("Email này đã được sử dụng!");
        }
      }

      await this.prisma.accountsUser.update({
        where: { id: account.id },
        data: body,
      });

      return {
        code: "success",
        message: "Cập nhật thành công!"
      };
    } catch (error) {
      throw new BadRequestException("Không thể cập nhật hồ sơ!");
    }
  }
}