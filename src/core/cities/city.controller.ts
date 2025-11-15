import { Controller, Get, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';


@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Get('list')
  async list() {
    return this.cityService.list();
  }
}
