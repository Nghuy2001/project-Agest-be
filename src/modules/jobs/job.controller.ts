import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JobService } from "./job.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EmployerGuard } from "../companies/guards/company.guard";

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @Get('detail/:id')
  async getJobDetail(@Param('id') slug: string) {
    return this.jobService.getJobDetail(slug);
  }
}