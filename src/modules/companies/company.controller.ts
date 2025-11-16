import { Body, Controller, Get, Patch, Post, Query, Request, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateJobDto, LoginDto, RegisterDto, UpdateCompanyDto } from './dto/company.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { EmployerGuard } from './guards/company.guard';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService,
    private cloudinary: CloudinaryService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.companyService.register(registerDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.companyService.login(loginDto, res);
  }
  @Patch('profile')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async updateProfile(
    @UploadedFile() logo: Express.Multer.File,
    @Body() body: UpdateCompanyDto,
    @Request() req
  ) {
    let uploadedImage: UploadApiResponse | null = null;
    if (logo) {
      uploadedImage = await this.cloudinary.uploadImage(logo);
    }
    const id = req.account.id;
    return this.companyService.updateProfile(body, id, uploadedImage?.secure_url || undefined);
  }
  @Post('job/create')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FilesInterceptor('images', 12))
  async createJob(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: CreateJobDto,
    @Request() req) {

    let uploadedImages: string[] = [];
    if (images && images.length > 0) {
      const uploadPromises = images.map(file => this.cloudinary.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(r => r.secure_url);
    }

    return this.companyService.createJob(
      body,
      req.account.id,
      uploadedImages
    );
  }

  @Get('job/list')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async getJobList(@Request() req, @Query('page') page: string) {
    const accountCompany = req.account;
    const pageNumber = page ? parseInt(page, 10) : 1;
    return this.companyService.getJobList(accountCompany, pageNumber);
  }
}