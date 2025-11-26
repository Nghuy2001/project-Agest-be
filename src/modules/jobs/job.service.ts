import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { JobApplyDto } from "./dto/job.dto";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) { }

  async getJobDetail(id: string) {
    try {
      const record = await this.prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            include: { city: true }
          }
        }
      });

      if (!record) throw new NotFoundException("Invalid job ID.");

      const jobDetail = {
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
        companyName: record.company?.companyName ?? "",
        companyLogo: record.company?.logo ?? "",
        companyModel: record.company?.companyModel ?? "",
        companyEmployees: record.company?.companyEmployees ?? "",
        companyWorkingTime: record.company?.workingTime ?? "",
        companyWorkOvertime: record.company?.workOvertime ?? "",
        jobAddress: record.company?.city?.name ?? record.company?.address ?? ""
      };
      return {
        code: "success",
        message: 'Job details retrieved successfully.',
        jobDetail
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve job details.');
    }
  }
  async jobApply(body: JobApplyDto, accountUser: any, url?: string) {
    try {
      const job = await this.prisma.job.findFirst({
        where: { id: body.jobId }
      });
      if (!job) {
        throw new NotFoundException("Job does not exist.");
      }
      const urlNew = url ? url : "";
      await this.prisma.cV.create({
        data: {
          fullName: body.fullName,
          email: accountUser.email,
          phone: body.phone,
          fileCV: urlNew,
          job: {
            connect: { id: body.jobId }
          },

          user: {
            connect: { id: accountUser.id }
          }
        },
      });
      return {
        code: "success",
        message: "Application submitted successfully."
      };
    } catch (error) {
      console.error("Error during job application", error);
      throw new InternalServerErrorException("Failed to submit CV. Please try again.");
    }
  }
}