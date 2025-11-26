import { Injectable, } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SearchJobDto } from './dto/search.dto';
import { createSearch } from 'src/core/helpers/createSearch';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }
  async search(query: SearchJobDto) {
    const { language, city, company, keyword, position, workingForm, page, salaryMin, salaryMax } = query;
    const find: any = {
      display: true,
      AND: []
    };
    if (keyword) {
      find.AND.push({ search: { contains: createSearch(keyword) } });
    }

    if (language) {
      find.AND.push({ search: { contains: createSearch(language) } });
    }
    if (city) {
      const cityInfo = await this.prisma.city.findFirst({
        where: { name: city }
      });

      if (cityInfo) {
        const companyIds = await this.prisma.accountCompany
          .findMany({
            where: { cityId: cityInfo.id },
            select: { id: true }
          })
          .then((rows) => rows.map((c) => c.id));

        if (companyIds.length > 0) {
          find.AND.push({ companyId: { in: companyIds } });
        } else {
          find.AND.push({ companyId: "__NO_COMPANY__" });
        }
      }
    }
    if (company) {
      const companyInfo = await this.prisma.accountCompany.findFirst({
        where: { companyName: company }
      });

      if (companyInfo) {
        find.AND.push({ companyId: companyInfo.id });
      } else {
        find.AND.push({ companyId: "__NO_COMPANY__" });
      }
    }

    if (position) find.AND.push({ position });
    if (workingForm) find.AND.push({ workingForm });
    const min = salaryMin ? Number(salaryMin) : null;
    const max = salaryMax ? Number(salaryMax) : null;

    if (min || max) {
      const salaryFilter: any = {};

      if (min) {
        salaryFilter.salaryMax = { gte: min };
      }

      if (max) {
        salaryFilter.salaryMin = { lte: max };
      }

      find.AND.push(salaryFilter);
    }
    const limit = 2;
    const currentPage = page && Number(page) > 0 ? Number(page) : 1;
    const skip = (currentPage - 1) * limit;

    const totalRecord = await this.prisma.job.count({ where: find });
    const totalPage = Math.ceil(totalRecord / limit);

    if (currentPage > totalPage && totalPage > 0) {
      return {
        code: "success",
        message: "Job search completed successfully.",
        jobs: [],
        totalPage,
        totalRecord
      };
    }
    const jobs = await this.prisma.job.findMany({
      where: find,
      take: limit,
      skip,
      include: {
        company: {
          include: { city: true }
        }
      }
    });

    const dataFinal = jobs.map((item) => ({
      id: item.id,
      title: item.title,
      salaryMin: item.salaryMin,
      salaryMax: item.salaryMax,
      position: item.position,
      workingForm: item.workingForm,
      technologies: item.technologies,

      companyLogo: item.company?.logo ?? "",
      companyName: item.company?.companyName ?? "",
      companyCity: item.company?.city?.name ?? ""
    }));
    return {
      code: "success",
      message: 'Job search completed successfully.',
      jobs: dataFinal,
      totalPage: totalPage,
      totalRecord: totalRecord
    };
  }
}
