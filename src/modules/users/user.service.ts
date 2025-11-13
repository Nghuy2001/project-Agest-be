import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/user.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import bcrypt from "bcryptjs";
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }
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
}