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
      display: true
    };
    let totalPage = 0;
    let totalRecord = 0;

    if (keyword || language) {
      find.AND = [];

      if (keyword) {
        find.AND.push({ search: { contains: createSearch(keyword) } });
      }
      if (language) {
        find.AND.push({ search: { contains: createSearch(language) } });
      }
    }
    if (city) {
      const cityName = await this.prisma.city.findFirst({
        where: { name: city }
      })
      if (cityName) {
        const companies = await this.prisma.accountCompany.findMany({
          where: { cityId: cityName.id },
          select: { id: true }
        })
        const companyIds = companies.map(item => item.id);
        find.companyId = { in: companyIds };
      }
    }
    if (company) {
      const accountCompany = await this.prisma.accountCompany.findFirst({ where: { companyName: company } });
      find.companyId = accountCompany ? accountCompany.id : "";
    }

    if (position) {
      find.position = position;
    }
    if (workingForm) {
      find.workingForm = workingForm;
    }
    const min = salaryMin ? Number(salaryMin) : undefined;
    const max = salaryMax ? Number(salaryMax) : undefined;
    if (min || max) {
      if (!find.AND) find.AND = [];
      const salaryCondition: any = {};

      if (min) {
        salaryCondition.salaryMax = { gte: min };
      }
      if (max) {
        salaryCondition.salaryMin = {
          ...(salaryCondition.salaryMin || {}),
          lte: max
        };
      }
      find.AND.push(salaryCondition);
    }
    const limitItems = 2;
    let currentPage = 1
    if (page && parseInt(`${page}`) > 0) {
      currentPage = parseInt(`${page}`);
    }
    totalRecord = await this.prisma.job.count({ where: find });
    totalPage = Math.ceil(totalRecord / limitItems);
    if (currentPage > totalPage && totalPage > 0) {
      return {
        code: "success",
        message: 'Job search completed successfully.',
        jobs: [],
        totalPage: totalPage,
        totalRecord: totalRecord
      };
    }
    const skipItems = (currentPage - 1) * limitItems;
    const jobs = await this.prisma.job.findMany({
      where: find,
      take: limitItems,
      skip: skipItems,
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

      companyLogo: item.company?.logo || "",
      companyName: item.company?.companyName || "",
      companyCity: item.company?.city?.name || "",
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
