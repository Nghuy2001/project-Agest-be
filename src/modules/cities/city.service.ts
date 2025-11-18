import { Injectable, } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private readonly prisma: PrismaService) { }
  async list() {
    const cityList = await this.prisma.city.findMany()
    return {
      code: "success",
      message: 'City list fetched successfully',
      cityList
    };
  }
}
