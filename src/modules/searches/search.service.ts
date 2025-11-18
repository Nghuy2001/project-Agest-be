import { Injectable, } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SearchJobDto } from './dto/search.dto';
import { createSearch } from 'src/core/helpers/createSearch';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }
  async search(query: SearchJobDto) {
    const { language, city, company, keyword, position, workingForm } = query;
    const find: any = {};
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

    const jobs = await this.prisma.job.findMany({
      where: find,
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
      message: 'Lấy danh sách thành phố thành công!',
      jobs: dataFinal
    };
  }
}
