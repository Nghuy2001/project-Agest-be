import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { cleanObject } from 'src/core/helpers/cleanObject';
import { updateProfileDto } from './dto/user.dto';
import { Account } from 'src/core/interfaces/account.interface';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }


  async updateProfile(body: updateProfileDto, account: Account, avatarUrl?: string) {
    try {
      const data = cleanObject({
        ...body,
        avatar: avatarUrl ?? body.avatar,
      });

      if (data.email) {
        const existEmail = await this.prisma.accountsUser.findFirst({
          where: {
            email: data.email,
            NOT: { id: account.id },
          },
        });
        if (existEmail) {
          throw new BadRequestException('This email is already in use!');
        }
      }

      await this.prisma.accountsUser.update({
        where: { id: account.id },
        data,
      });

      return {
        code: 'success',
        message: 'Profile updated successfully!',
      };
    } catch (error) {
      throw new BadRequestException("Failed to update profile!");
    }
  }

  async getCVList(accountUser: Account, page?: string) {
    const pageSize = 2;
    const pageNumber = Math.max(Number(page) || 1, 1);

    const email = accountUser.email;

    const totalRecord = await this.prisma.cV.count({
      where: { email },
    });

    const totalPage = Math.ceil(totalRecord / pageSize);

    const listCV = await this.prisma.cV.findMany({
      where: { email },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    const dataFinal = listCV.map((cv) => ({
      id: cv.id,
      jobTitle: cv.job?.title ?? '',
      companyName: cv.job?.company?.companyName ?? '',
      jobSalaryMin: Number(cv.job?.salaryMin ?? 0),
      jobSalaryMax: Number(cv.job?.salaryMax ?? 0),
      jobPosition: cv.job?.position ?? '',
      jobWorkingForm: cv.job?.workingForm ?? '',
      status: cv.status,
      viewed: cv.viewed,
    }));
    return {
      code: "success",
      message: "successfully",
      listCV: dataFinal,
      totalPage
    }
  }

  async cvDetail(cvId: string, userId: string) {
    try {
      const infoCV = await this.prisma.cV.findUnique({
        where: { id: cvId, userId },
        include: {
          job: {
            include: { company: true },
          },
        },
      });

      if (!infoCV)
        throw new NotFoundException(`CV with id ${cvId} not found`);

      if (!infoCV.job)
        throw new ForbiddenException('You do not have permission');

      return {
        code: 'success',
        message: 'CV details retrieved successfully',
        infoCV: {
          fullName: infoCV.fullName,
          email: infoCV.email,
          phone: infoCV.phone,
          fileCV: infoCV.fileCV,
        },
        infoJob: {
          id: infoCV.job.id,
          title: infoCV.job.title,
          salaryMin: infoCV.job.salaryMin,
          salaryMax: infoCV.job.salaryMax,
          position: infoCV.job.position,
          workingForm: infoCV.job.workingForm,
          technologies: infoCV.job.technologies,
          companyName: infoCV.job.company?.companyName ?? '',
        },
      };
    } catch (error) {
      console.error('cvDetail error:', error);
      throw new InternalServerErrorException(
        'Server error, please try again later',
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