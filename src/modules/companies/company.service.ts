import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { cleanObject } from 'src/core/helpers/cleanObject';
import { createSearch } from 'src/core/helpers/createSearch';
import { changeStatusDto, createJobDto, updateCompanyDto, updateJobDto } from './dto/company.dto';
@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService
  ) { }

  async updateProfile(body: updateCompanyDto, id: string, logoUrl?: string) {
    try {
      const updateData: any = { ...body };

      if (logoUrl) {
        updateData.logo = logoUrl;
      }
      for (const key in updateData) {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      }

      await this.prisma.accountCompany.update({
        where: { id },
        data: updateData,
      });

      return {
        code: "success",
        message: "Profile updated successfully!",
      };
    } catch (error) {
      throw new BadRequestException("Unable to update profile!");
    }
  }

  async createJob(body: createJobDto, companyId: string, images?: string[]) {
    const dataToCreate: any = { ...body };
    dataToCreate.salaryMin = parseInt(dataToCreate.salaryMin ?? '0', 10);
    dataToCreate.salaryMax = parseInt(dataToCreate.salaryMax ?? '0', 10);

    dataToCreate.technologies = dataToCreate.technologies
      ? dataToCreate.technologies.split(",").map((t: any) => t.trim()).filter(Boolean)
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
  async getJobList(company: { id: string }, page = 1) {
    const limit = 6;
    const skip = (page - 1) * limit;

    const [total, jobs, companyInfo] = await this.prisma.$transaction([
      this.prisma.job.count({ where: { companyId: company.id } }),

      this.prisma.job.findMany({
        where: { companyId: company.id },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.accountCompany.findUnique({
        where: { id: company.id },
        include: { city: true },
      }),
    ]);

    if (!companyInfo) throw new NotFoundException('Company not found');

    const data = jobs.map((job) => ({
      id: job.id,
      companyLogo: companyInfo.logo,
      companyName: companyInfo.companyName,
      cityName: companyInfo.city?.name,
      title: job.title,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      position: job.position,
      workingForm: job.workingForm,
      technologies: job.technologies,
      display: job.display,
    }));

    return {
      code: 'success',
      message: 'Job list',
      dataFinal: data,
      totalPage: Math.ceil(total / limit),
    };
  }

  async getJobDetail(companyId: string, jobId: string) {
    const jobDetail = await this.prisma.job.findFirst({
      where: { id: jobId, companyId: companyId },
    });

    if (!jobDetail) throw new NotFoundException('Job not found');

    return { code: 'success', message: 'Job detail', jobDetail };
  }
  async patchJobDetail(companyId: string, body: updateJobDto, id: string, images?: string[]) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyId } });
      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
      }
      const dataToUpdate: any = { ...body };
      dataToUpdate.salaryMin = body.salaryMin !== undefined ? (body.salaryMin !== "" ? parseInt(body.salaryMin) || 0 : 0) : jobDetail.salaryMin;
      dataToUpdate.salaryMax = body.salaryMax !== undefined ? (body.salaryMax !== "" ? parseInt(body.salaryMax) || 0 : 0) : jobDetail.salaryMax;
      dataToUpdate.technologies = body.technologies !== undefined ? (body.technologies ? body.technologies.split(",").map((t: any) => t.trim()) : []) : jobDetail.technologies;
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
      throw error;
    }
  }

  async deleteJob(companyId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const jobDetail = await tx.job.findFirst({
        where: { id, companyId: companyId },
      });

      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
      }

      await tx.cV.deleteMany({
        where: { jobId: id },
      });

      await tx.job.delete({
        where: { id },
      });

      return {
        code: "success",
        message: "Job deleted successfully!",
      };
    });
  }
  async changeDisplay(companyId: string, id: string) {
    try {
      const jobDetail = await this.prisma.job.findFirst({ where: { id: id, companyId: companyId } });
      if (!jobDetail) {
        throw new NotFoundException("Job ID does not exist!");
      }
      await this.prisma.job.update({
        where: { id: id },
        data: {
          display: !jobDetail.display,
        },
      });

      return {
        code: "success",
        message: "Job changed display successfully!"
      };
    } catch (error) {
      throw error;
    }
  }
  async listCompanies(query: any) {
    const page = Number(query.page) || 1;
    const take = 6;
    const skip = (page - 1) * take;

    const [total, companies] = await this.prisma.$transaction([
      this.prisma.accountCompany.count(),
      this.prisma.accountCompany.findMany({
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          city: true,
          _count: { select: { jobs: true } },
        },
      }),
    ]);
    return {
      code: 'success',
      companyListFinal: companies.map((c) => ({
        id: c.id,
        logo: c.logo,
        companyName: c.companyName,
        cityName: c.city?.name,
        totalJob: c._count.jobs,
      })),
      totalPage: Math.ceil(total / take),
    };
  }

  async detailCompany(id: string) {
    const company = await this.prisma.accountCompany.findUnique({
      where: { id },
      include: {
        city: true,
        jobs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    return {
      code: 'success',
      companyDetail: {
        id: company.id,
        logo: company.logo,
        companyName: company.companyName,
        address: company.address,
        companyModel: company.companyModel,
        companyEmployees: company.companyEmployees,
        workingTime: company.workingTime,
        workOvertime: company.workOvertime,
        description: company.description,
        cityName: company.city?.name,
      },
      jobList: company.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        companyName: company.companyName,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        position: j.position,
        workingForm: j.workingForm,
        technologies: j.technologies,
      })),
    };
  }


  async cvList(companyId: string, page?: string) {
    try {
      const pageSize = 2;
      let pageNumber = Number(page);
      if (!pageNumber || pageNumber <= 0) pageNumber = 1;
      const listJobIds = await this.prisma.job.findMany({
        where: { companyId },
        select: { id: true }
      }).then(jobs => jobs.map(j => j.id));

      if (listJobIds.length === 0) {
        return {
          code: "success",
          message: "No CVs found",
          dataFinal: [],
          totalPage: 0
        };
      }

      const totalRecord = await this.prisma.cV.count({
        where: { jobId: { in: listJobIds } }
      });

      const totalPage = Math.ceil(totalRecord / pageSize);
      const skip = (pageNumber - 1) * pageSize;

      const listCV = await this.prisma.cV.findMany({
        where: { jobId: { in: listJobIds } },
        include: { job: true },
        take: pageSize,
        skip,
        orderBy: { createdAt: "desc" }
      });

      const dataFinal = listCV.map(item => ({
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        viewed: item.viewed,
        status: item.status,
        jobTitle: item.job?.title ?? "",
        jobSalaryMin: item.job?.salaryMin ?? null,
        jobSalaryMax: item.job?.salaryMax ?? null,
        jobPosition: item.job?.position ?? null,
        jobWorkingForm: item.job?.workingForm ?? null,
      }));

      return {
        code: "success",
        message: "CV list retrieved successfully",
        dataFinal,
        totalPage
      };

    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Server error, please try again later",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cvDetail(cvId: string, companyId: string) {
    const cv = await this.prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundException('CV not found');

    const job = await this.prisma.job.findFirst({
      where: { id: cv.jobId, companyId },
    });

    if (!job) throw new ForbiddenException('No permission');
    await this.prisma.cV.update({
      where: { id: cvId },
      data: { viewed: true },
    });

    return {
      code: 'success',
      infoCV: {
        fullName: cv.fullName,
        email: cv.email,
        phone: cv.phone,
        fileCV: cv.fileCV,
      },
      infoJob: {
        id: job.id,
        title: job.title,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        position: job.position,
        workingForm: job.workingForm,
        technologies: job.technologies,
      },
    };
  }

  async changeStatusPatch(body: changeStatusDto, companyId: string) {
    return this.prisma.$transaction(async (tx) => {

      const cv = await tx.cV.findUnique({
        where: { id: body.id },
      });

      if (!cv) throw new NotFoundException('CV not found');

      const job = await tx.job.findFirst({
        where: { id: cv.jobId, companyId },
      });

      if (!job) throw new ForbiddenException('No permission');
      await tx.cV.update({
        where: { id: body.id },
        data: { status: body.action },
      });

      return {
        code: 'success',
        message: 'Status updated',
      };
    });
  }


  async deleteCV(companyId: string, id: string) {
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
        throw new ForbiddenException("You do not have permission to delete this CV!");
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
      throw error;
    }
  }

}