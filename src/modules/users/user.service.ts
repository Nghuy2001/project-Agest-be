import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { cleanObject } from 'src/core/helpers/cleanObject';
import { title } from 'process';
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

  async login(data: LoginDto, res: Response) {
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
    const payload = { id: existingUser.id, username: existingUser.email, role: existingUser.role };
    const token = await this.jwtService.signAsync(payload);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });
    return { message: "Login successful!" };
  }
  async updateProfile(body: any, account: any, avatarUrl?: string) {
    try {
      if (avatarUrl) body.avatar = avatarUrl;
      else {
        delete body.avatar;
      }
      const data = cleanObject(body);
      if (data.email) {
        const existEmail = await this.prisma.accountsUser.findFirst({
          where: {
            email: data.email,
            NOT: { id: account.id }
          }
        });

        if (existEmail) {
          throw new BadRequestException("This email is already in use!");
        }
      }

      await this.prisma.accountsUser.update({
        where: { id: account.id },
        data: data,
      });

      return {
        code: "success",
        message: "Profile updated successfully!"
      };
    } catch (error) {
      throw new BadRequestException("Failed to update profile!");
    }
  }

  async getCVList(accountUser: any, page?: string) {
    const pageSize = 2;
    let pageNumber = Number(page);
    if (!pageNumber || pageNumber <= 0) pageNumber = 1;
    const email = accountUser.email;
    const totalRecord = await this.prisma.cV.count({
      where: { email: email }
    })
    const totalPage = Math.ceil(totalRecord / pageSize);
    const skip = (pageNumber - 1) * pageSize;
    const listCV = await this.prisma.cV.findMany({
      where: { email: email },
      take: pageSize,
      skip: skip,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    })
    const dataFinal = listCV.map(cv => {
      const job = cv.job;
      const company = job?.company;
      return {
        id: cv.id,
        jobTitle: job?.title || "",
        companyName: company?.companyName || "",
        jobSalaryMin: job?.salaryMin ? Number(job.salaryMin) : 0,
        jobSalaryMax: job?.salaryMax ? Number(job.salaryMax) : 0,
        jobPosition: job?.position || "",
        jobWorkingForm: job?.workingForm || "",
        status: cv.status,
        viewed: cv.viewed
      }
    });


    return {
      code: "success",
      message: "successfully",
      listCV: dataFinal,
      totalPage
    }
  }

  async cvDetail(cvId: string, companyId: any) {
    try {
      const infoCV = await this.prisma.cV.findUnique({
        where: { id: cvId }
      })
      if (!infoCV) throw new NotFoundException(`CV with id ${cvId} not found`);
      const infoJob = await this.prisma.job.findFirst({
        where: {
          id: infoCV.jobId,
        }
      })
      if (!infoJob) throw new ForbiddenException("You do not have permission to access this resource");
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
        technologies: infoJob.technologies
      }
      return {
        code: "success",
        message: "CV details retrieved successfully",
        infoCV: dataFinalCV,
        infoJob: dataFinalJob
      }
    } catch (error) {
      console.error("cvDetail error:", error);
      throw new HttpException(
        "Server error, please try again later",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteCV(userId: string, id: string) {
    try {
      const infoCV = await this.prisma.cV.findFirst({
        where: {
          id: id,
          userId: userId
        }
      });

      if (!infoCV) {
        throw new NotFoundException("CV ID does not exist or you do not have permission to delete it!");
      }
      await this.prisma.cV.delete({
        where: { id: id }
      });

      return {
        code: "success",
        message: "CV deleted successfully"
      };

    } catch (error) {
      console.error("Error deleting CV:", error);
      throw new InternalServerErrorException("Failed to delete CV");
    }
  }
}