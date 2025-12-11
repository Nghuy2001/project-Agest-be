import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { JobApplyDto } from "./dto/job.dto";
import { Account } from "src/core/interfaces/account.interface";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) { }


  async getJobDetail(id: string) {
    try {
      const record = await this.prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            include: { city: true },
          },
        },
      });

      if (!record) {
        throw new NotFoundException('Invalid job ID.');
      }

      return {
        code: 'success',
        message: 'Job details retrieved successfully.',
        jobDetail: {
          id: record.id,
          title: record.title,
          salaryMin: record.salaryMin,
          salaryMax: record.salaryMax,
          images: record.images,
          position: record.position,
          workingForm: record.workingForm,
          technologies: record.technologies,
          description: record.description,
          companyId: record.companyId,
          companyName: record.company?.companyName ?? '',
          companyLogo: record.company?.logo ?? '',
          companyModel: record.company?.companyModel ?? '',
          companyEmployees: record.company?.companyEmployees ?? '',
          companyWorkingTime: record.company?.workingTime ?? '',
          companyWorkOvertime: record.company?.workOvertime ?? '',
          jobAddress:
            record.company?.city?.name ??
            record.company?.address ??
            '',
        },
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        'Failed to retrieve job details.',
      );
    }
  }
  async jobApply(
    body: JobApplyDto,
    accountUser: Account,
    fileUrl?: string,
  ) {
    try {
      const jobExists = await this.prisma.job.findFirst({
        where: { id: body.jobId },
        select: { id: true },
      });

      if (!jobExists) {
        throw new NotFoundException('Job does not exist.');
      }

      await this.prisma.cV.create({
        data: {
          fullName: body.fullName,
          email: accountUser.email,
          phone: body.phone,
          fileCV: fileUrl ?? '',
          job: { connect: { id: body.jobId } },
          user: { connect: { id: accountUser.id } },
        },
      });

      return {
        code: 'success',
        message: 'Application submitted successfully.',
      };
    } catch (err) {
      console.error('Error during job application', err);
      throw new InternalServerErrorException(
        'Failed to submit CV. Please try again.',
      );
    }
  }
}