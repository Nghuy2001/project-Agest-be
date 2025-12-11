import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { EmployerGuard } from './guards/company.guard';
import { changeStatusDto, createJobDto, updateCompanyDto, updateJobDto } from './dto/company.dto';
import type { Request } from 'express';



@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService,
    private cloudinary: CloudinaryService,
  ) { }
  @Patch('profile')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async updateProfile(
    @UploadedFile() logo: Express.Multer.File,
    @Body() body: updateCompanyDto,
    @Req() req: Request
  ) {
    let uploadedImage: UploadApiResponse | null = null;
    if (logo) {
      uploadedImage = await this.cloudinary.uploadImage(logo);
    }
    const companyId = req.account.id;
    return this.companyService.updateProfile(body, companyId, uploadedImage?.secure_url || undefined);
  }
  @Post('job/create')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FilesInterceptor('images', 12))
  async createJob(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: createJobDto,
    @Req() req: Request) {

    let uploadedImages: string[] = [];
    if (images && images.length > 0) {
      const uploadPromises = images.map(file => this.cloudinary.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(r => r.secure_url);
    }
    const companyId = req.account.id;
    return this.companyService.createJob(
      body,
      companyId,
      uploadedImages
    );
  }

  @Get('job/list')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async getJobList(@Req() req: Request, @Query('page') page: string) {
    const accountCompany = req.account;
    const pageNumber = page ? parseInt(page, 10) : 1;
    return this.companyService.getJobList(accountCompany, pageNumber);
  }
  @Get('job/edit/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async getJobDetail(@Req() req: Request, @Param('id') id: string) {
    const companyId = req.account.id;
    return this.companyService.getJobDetail(companyId, id);
  }
  @Patch('job/edit/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FilesInterceptor('images', 12))
  async patchJobDetail(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: updateJobDto,
    @Req() req: Request,
    @Param('id') id: string) {
    let uploadedImages: string[] = [];

    if (images && images.length > 0) {
      const uploadPromises = images.map(file => this.cloudinary.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(r => r.secure_url);
    }
    const companyId = req.account.id;
    return this.companyService.patchJobDetail(companyId, body, id, uploadedImages);
  }

  @Delete('job/delete/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async deleteJob(@Req() req: Request, @Param('id') id: string) {
    const companyId = req.account.id;
    return this.companyService.deleteJob(companyId, id);
  }

  @Patch('job/change-display/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async changeDisplay(@Req() req: Request, @Param('id') id: string) {
    const companyId = req.account.id;
    return this.companyService.changeDisplay(companyId, id);
  }

  @Get('list')
  async listCompanies(@Query() query: { pageSize?: string; page?: string }) {
    return this.companyService.listCompanies(query);
  }


  @Get('detail/:id')
  async detailCompany(@Param('id') id: string) {
    return this.companyService.detailCompany(id);
  }

  @Get('cv/list')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async cvList(@Req() req: Request, @Query('page') page?: string) {
    const companyId = req.account.id;
    return this.companyService.cvList(companyId, page);
  }
  @Get('cv/detail/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async cvDetail(@Param('id') id: string, @Req() req: Request) {
    const companyId = req.account.id;
    return this.companyService.cvDetail(id, companyId);
  }

  @Patch('cv/change-status')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async changeStatusPatch(@Req() req: Request, @Body() body: changeStatusDto) {
    const companyId = req.account.id;
    return this.companyService.changeStatusPatch(body, companyId);
  }
  @Delete('cv/delete/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async deleteCV(@Req() req: Request, @Param('id') id: string) {
    const companyId = req.account.id;
    return this.companyService.deleteCV(companyId, id);
  }

}