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
  async login(data: LoginDto, res: Response) {
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
    const token = await this.jwtService.signAsync(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });
    return { message: "Login successful!" };
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
        message: "Profile updated successfully!"
      };
    } catch (error) {
      throw new BadRequestException("Unable to update profile!");
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
      message: "Job created successfully!"
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
        message: "Company not found!"
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
      message: "Job list retrieved successfully!",
      dataFinal,
      totalPage
    }
  }
  async getJobDetail(companyAccount: any, id: string) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
      }

      return {
        code: "success",
        message: "Job details retrieved successfully!",
        jobDetail: jobDetail
      }
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }
  async patchJobDetail(companyAccount: any, body: any, id: string, images?: string[]) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
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
        message: "Job updated successfully!"
      }
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

  }

  async deleteJob(companyAccount: any, id: string) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyAccount.id } });
      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
      }
      await this.prisma.job.delete({ where: { id: id } });
      return {
        code: "success",
        message: "Job deleted successfully!"
      };
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async listCompanies(query: any) {
    const pageSize = 6;
    let page = Number(query.page);
    if (!page || page <= 0) page = 1;
    const totalRecord = await this.prisma.accountCompany.count();
    const totalPage = Math.ceil(totalRecord / pageSize);
    const skip = (page - 1) * pageSize;
    const companies = await this.prisma.accountCompany.findMany({
      take: pageSize,
      skip: skip,
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
      message: "Company list retrieved successfully!",
      companyListFinal: finalData,
      totalPage
    };
  }

  async detailCompany(id: string) {
    try {
      const record = await this.prisma.accountCompany.findUnique({
        where: { id },
        include: {
          city: true,
          jobs: {
            orderBy: { createdAt: "desc" }
          }
        }
      })
      if (!record) {
        throw new NotFoundException("Invalid company ID!")
      }
      const companyDetail = {
        id: record.id,
        logo: record.logo,
        companyName: record.companyName,
        address: record.address,
        companyModel: record.companyModel,
        companyEmployees: record.companyEmployees,
        workingTime: record.workingTime,
        workOvertime: record.workOvertime,
        description: record.description,
        cityName: record.city?.name ?? ""
      }
      const jobList = record.jobs.map(job => ({
        id: job.id,
        companyLogo: record.logo,
        title: job.title,
        companyName: record.companyName,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        position: job.position,
        workingForm: job.workingForm,
        companyCity: record.city?.name ?? "",
        technologies: job.technologies,
      }));
      return {
        code: "success",
        message: "Company detail retrieved successfully!",
        companyDetail,
        jobList
      }
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cvList(id: string, page?: string) {
    const pageSize = 2;
    let pageNumber = Number(page);
    if (!pageNumber || pageNumber <= 0) pageNumber = 1;

    const listJob = await this.prisma.job.findMany({
      where: { companyId: id }
    });
    const listJobId = listJob.map(job => job.id);
    const totalRecord = await this.prisma.cV.count({
      where: { jobId: { in: listJobId } }
    });
    const totalPage = Math.ceil(totalRecord / pageSize);
    const skip = (pageNumber - 1) * pageSize;
    const listCV = await this.prisma.cV.findMany({
      where: { jobId: { in: listJobId } },
      take: pageSize,
      skip,
      orderBy: { createdAt: "desc" }
    });
    const dataFinal: any = []
    for (const item of listCV) {
      const dataItemFinal = {
        id: item.id,
        jobTitle: "",
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        jobSalaryMin: 0,
        jobSalaryMax: 0,
        jobPosition: "",
        jobWorkingForm: "",
        viewed: item.viewed,
        status: item.status,
      }
      const infoJob = await this.prisma.job.findFirst({
        where: { id: item.jobId }
      })
      if (infoJob) {
        dataItemFinal.jobTitle = `${infoJob.title}`;
        dataItemFinal.jobSalaryMin = parseInt(`${infoJob.salaryMin}`);
        dataItemFinal.jobSalaryMax = parseInt(`${infoJob.salaryMax}`);
        dataItemFinal.jobPosition = `${infoJob.position}`;
        dataItemFinal.jobWorkingForm = `${infoJob.workingForm}`;
      }
      dataFinal.push(dataItemFinal);
    }
    return {
      code: "success",
      message: "CV list retrieved successfully",
      dataFinal,
      totalPage
    }
  }
  async cvDetail(cvId: string, companyId: string) {
    try {
      const infoCV = await this.prisma.cV.findUnique({
        where: {
          id: cvId
        }
      });
      if (!infoCV) throw new NotFoundException(`CV with id ${cvId} not found`)

      const infoJob = await this.prisma.job.findFirst({
        where: {
          id: infoCV.jobId,
          companyId: companyId
        }
      })
      if (!infoJob) throw new ForbiddenException('You do not have permission to access this resource');
      const dataFinalCV = {
        fullName: infoCV.fullName,
        email: infoCV.email,
        phone: infoCV.phone,
        fileCV: infoCV.fileCV
      }
      const dataFinalJob = {
        id: infoJob.id,
        title: infoJob.title,
        salaryMin: infoJob.salaryMin,
        salaryMax: infoJob.salaryMax,
        position: infoJob.position,
        workingForm: infoJob.workingForm,
        technologies: infoJob.technologies,
      }
      await this.prisma.cV.update({
        where: { id: cvId },
        data: { viewed: true },
      });
      return {
        code: "success",
        message: "CV details retrieved successfully",
        infoCV: dataFinalCV,
        infoJob: dataFinalJob
      }
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async changeStatusPatch(body: any, companyId: string) {
    try {
      const infoCV = await this.prisma.cV.findUnique({
        where: { id: body.id }
      })
      if (!infoCV) throw new NotFoundException("Invalid company ID!");
      const infoJob = await this.prisma.job.findFirst({
        where: {
          id: infoCV.jobId,
          companyId: companyId
        }
      })
      if (!infoJob) {
        throw new ForbiddenException("You do not have permission to log in here!");
      }
      await this.prisma.cV.update({
        where: { id: body.id },
        data: { status: body.action },
      });
      return {
        code: "success",
        message: ""
      }
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async deleteCV(companyId: any, id: string) {
    try {
      const infoCV = await this.prisma.cV.findFirst({ where: { id: id } });
      if (!infoCV) {
        throw new NotFoundException("CV ID does not exist!");
      }
      const infoJob = await this.prisma.job.findFirst({
        where: {
          id: infoCV.jobId,
          companyId: companyId
        }
      })
      if (!infoJob) {
        throw new ForbiddenException("You do not have permission to log in here!");
      }
      await this.prisma.cV.delete({
        where: {
          id: id
        }
      })
      return {
        code: "success",
        message: "CV deleted successfully!"
      };
    } catch (error) {
      throw new HttpException(
        "Server error, please try again later!",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}