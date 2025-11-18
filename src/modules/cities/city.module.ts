import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { CityController } from './city.controller';
import { CityService } from './city.service';


@Module({
  imports: [PrismaModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule { }
