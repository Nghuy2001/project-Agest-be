import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/company.dto';
import bcrypt from "bcryptjs";
import { Response } from 'express';
import { cleanObject } from 'src/core/helpers/cleanObject';
import { createSearch } from 'src/core/helpers/createSearch';
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
    if (existsCompany.role !== "employer") {
      throw new ForbiddenException("Bạn không có quyền đăng nhập ở khu vực này!");
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
    const dataToCreate: any = { ...body };
    dataToCreate.salaryMin = parseInt(dataToCreate.salaryMin ?? '0', 10);
    dataToCreate.salaryMax = parseInt(dataToCreate.salaryMax ?? '0', 10);

    dataToCreate.technologies = dataToCreate.technologies
      ? dataToCreate.technologies.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    dataToCreate.images = images || [];
    const data = cleanObject(dataToCreate);
    data.search = createSearch(`${data.title} ${data.technologies.join(" ")}`);
    await this.prisma.job.create({
      data: {
        ...data,
        company: {
          connect: { id: companyId }
        }
      },
    });

    return {
      code: "success",
      message: "Tạo công việc thành công!"
    };

  }
  async getJobList(companyAccount: any, page: number) {
    const find = {
      companyId: companyAccount.id,
    };
    const limitItems = 2;
    page = Number(page);
    if (!page || page <= 0) page = 1;
    const totalRecord = await this.prisma.job.count({
      where: find,
    });
    const totalPage = Math.ceil(totalRecord / limitItems);

    const skip = (page - 1) * limitItems;

    const jobs = await this.prisma.job.findMany({
      where: find,
      orderBy: { createdAt: "desc" },
      take: limitItems,
      skip: skip,
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
      dataFinal,
      totalPage
    }
  }
  async getJobDetail(companyAccount: any, id: string) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("ID công việc không tồn tại!");
      }

      return {
        code: "success",
        message: "Lấy thông tin công việc thành công!",
        jobDetail: jobDetail
      }
    } catch (error) {
      throw new HttpException(
        "Lỗi server, vui lòng thử lại sau!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }
  async patchJobDetail(companyAccount: any, body: any, id: string, images?: string[]) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("ID công việc không tồn tại!");
      }
      const dataToUpdate: any = { ...body };
      dataToUpdate.salaryMin = body.salaryMin !== undefined ? (body.salaryMin !== "" ? parseInt(body.salaryMin) || 0 : 0) : jobDetail.salaryMin;
      dataToUpdate.salaryMax = body.salaryMax !== undefined ? (body.salaryMax !== "" ? parseInt(body.salaryMax) || 0 : 0) : jobDetail.salaryMax;
      dataToUpdate.technologies = body.technologies !== undefined ? (body.technologies ? body.technologies.split(",").map((t) => t.trim()) : []) : jobDetail.technologies;
      dataToUpdate.images = images && images.length > 0 ? images : jobDetail.images;
      const data = cleanObject(dataToUpdate);
      data.search = createSearch(`${data.title} ${data.technologies.join(" ")}`);
      await this.prisma.job.update({
        where: { id },
        data: data,
      });

      return {
        code: "success",
        message: "Cập nhật thành công!",
      }
    } catch (error) {
      throw new HttpException(
        "Lỗi server, vui lòng thử lại sau!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async deleteJob(companyAccount: any, id: string) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("ID công việc không tồn tại!");
      }
      await this.prisma.job.delete({ where: { id: id } });
      return {
        code: "success",
        message: "Xóa công việc thành công!"
      };
    } catch (error) {
      throw new HttpException(
        "Lỗi server, vui lòng thử lại sau!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listCompanies(limitItems: string) {
    const limit = Number(limitItems) || 12;

    const companies = await this.prisma.accountCompany.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        city: true,
        _count: {
          select: { jobs: true }
        }
      }
    });

    const finalData = companies.map(c => ({
      id: c.id,
      logo: c.logo,
      companyName: c.companyName,
      cityName: c.city?.name || "",
      totalJob: c._count.jobs
    }));

    return {
      code: "success",
      message: "Lấy danh sách công ty thành công!",
      companyListFinal: finalData
    };
  }
}