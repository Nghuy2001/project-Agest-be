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
      return {
        code: "success",
        message: "Cập nhật thành công!"
      };
    } catch (error) {
      throw new BadRequestException("Không thể cập nhật hồ sơ!");
    }
  }

  async createJob(body: any, companyId: any, images?: string[]) {
    try {
      const dataToCreate: any = { ...body };
      dataToCreate.salaryMin = parseInt(dataToCreate.salaryMin) || 0;
      dataToCreate.salaryMax = parseInt(dataToCreate.salaryMax) || 0;

      if (dataToCreate.technologies) {
        dataToCreate.technologies = dataToCreate.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else {
        dataToCreate.technologies = [];
      }
      dataToCreate.images = images || [];
      Object.keys(dataToCreate).forEach(key => {
        if (dataToCreate[key] === "") dataToCreate[key] = null;
      });

      dataToCreate.companyId = companyId;
      await this.prisma.job.create({ data: dataToCreate });
      return {
        code: "success",
        message: "Tạo công việc thành công!"
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException("Không thể tạo công việc!");
    }
  }
  async getJobList(companyAccount: any) {
    const jobs = await this.prisma.job.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    const accountCompany = await this.prisma.accountCompany.findUnique({
      where: { id: companyAccount.id },
    });
    if (!accountCompany) {
      return {
        code: "error",
        message: "Không tìm thấy thông tin công ty!",
      };
    }
    let cityName: string | undefined = undefined;

    if (typeof accountCompany.cityId === "string" && accountCompany.cityId.trim() !== "") {
      const city = await this.prisma.city.findUnique({
        where: { id: accountCompany.cityId },
      });
      cityName = city?.name;
    }

    const dataFinal: any[] = [];
    for (const item of jobs) {
      dataFinal.push({
        id: item.id,
        companyLogo: accountCompany.logo,
        title: item.title,
        companyName: accountCompany.companyName,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        companyCity: cityName,
        technologies: item.technologies,
      });
    }
    return {
      code: "success",
      message: "Lấy danh sách công việc thành công!",
      dataFinal
    }
  }
}