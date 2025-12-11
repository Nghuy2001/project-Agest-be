import { BadRequestException, Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JobService } from "./job.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CandidateGuard } from "../users/guards/user.guard";
import { UploadApiResponse } from "cloudinary";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "src/core/cloudinary/cloudinary.service";
import { JobApplyDto } from "./dto/job.dto";
import type { Request } from "express";

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService,
    private cloudinary: CloudinaryService,
  ) { }

  @Get('detail/:id')
  async getJobDetail(@Param('id') slug: string) {
    return this.jobService.getJobDetail(slug);
  }
  @Post('apply')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  @UseInterceptors(FileInterceptor('fileCV', {
    fileFilter: (_, file, callback) => {
      if (!file.originalname.match(/\.(pdf)$/)) {
        return callback(
          new BadRequestException('Only PDF files are allowed.'),
          false,
        );
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async jobApply(
    @UploadedFile() logo: Express.Multer.File,
    @Body() body: JobApplyDto,
    @Req() req: Request
  ) {
    let uploadedImage: UploadApiResponse | null = null;
    if (logo) {
      uploadedImage = await this.cloudinary.uploadImage(logo);
    }
    return this.jobService.jobApply(body, req.account!, uploadedImage?.secure_url);
  }
}