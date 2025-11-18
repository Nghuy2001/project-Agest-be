import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { JobApplyDto } from "./dto/job.dto";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) { }

  async getJobDetail(id: string) {
    try {
      const record = await this.prisma.job.findUnique({ where: { id } });
      if (!record) {
        throw new NotFoundException('ID không hợp lệ!');
      }
      const jobDetail = {
        id: record.id,
        title: record.title,
        companyName: "",
        salaryMin: record.salaryMin,
        salaryMax: record.salaryMax,
        images: record.images,
        position: record.position,
        workingForm: record.workingForm,
        jobAddress: "",
        technologies: record.technologies,
        description: record.description,
        companyLogo: "",
        companyId: record.companyId,
        companyModel: "",
        companyEmployees: "",
        companyWorkingTime: "",
        companyWorkOvertime: ""
      }

      const companyInfo = await this.prisma.accountCompany.findUnique({
        where: { id: record.companyId }
      })
      if (companyInfo) {
        jobDetail.companyName = `${companyInfo.companyName}`;
        jobDetail.companyLogo = `${companyInfo.logo}`;
        jobDetail.companyModel = `${companyInfo.companyModel}`;
        jobDetail.companyEmployees = `${companyInfo.companyEmployees}`;
        jobDetail.companyWorkingTime = `${companyInfo.workingTime}`;
        jobDetail.companyWorkOvertime = `${companyInfo.workOvertime}`;
        const cityDetail = await this.prisma.city.findFirst({ where: { id: `${companyInfo.cityId}` } })
        jobDetail.jobAddress = cityDetail?.name || `${companyInfo.address}`;
      }
      return {
        code: "success",
        message: 'Lấy chi tiết công việc thành công!',
        jobDetail
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Có lỗi khi lấy chi tiết công việc!');
    }
  }
  async jobApply(body: JobApplyDto, accountUser: any, url?: string) {
    try {
      const job = await this.prisma.job.findFirst({
        where: { id: body.jobId }
      });
      if (!job) {
        throw new NotFoundException("Job không tồn tại!");
      }
      const urlNew = url ? url : "";
      const cv = await this.prisma.cV.create({
        data: {
          fullName: body.fullName,
          email: accountUser.username,
          phone: body.phone,
          fileCV: urlNew,
          job: {
            connect: { id: body.jobId }
          },

          user: {
            connect: { id: accountUser.id }
          }
        },
        include: {
          user: true,
          job: true
        }

      });
      return {
        code: "success",
        message: "Ứng tuyển thành công!"
      };
    } catch (error) {
      console.error("Lỗi khi ứng tuyển:", error);
      throw new InternalServerErrorException("Không thể gửi CV. Vui lòng thử lại!");
    }
  }
}