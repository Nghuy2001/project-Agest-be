import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/company.dto';
import bcrypt from "bcryptjs";
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

}