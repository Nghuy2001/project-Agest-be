import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";

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
}