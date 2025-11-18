import { Module } from "@nestjs/common";
import { PrismaModule } from "src/core/prisma/prisma.module";
import { JobController } from "./job.controller";
import { JobService } from "./job.service";
import { CloudinaryModule } from "src/core/cloudinary/cloudinary.module";

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule { }