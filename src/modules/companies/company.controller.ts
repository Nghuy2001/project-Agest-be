import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { EmployerGuard } from './guards/company.guard';
import { changeStatusDto, createJobDto, updateCompanyDto, updateJobDto } from './dto/company.dto';

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
    @Body() body: createJobDto,
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
  @Get('job/edit/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async getJobDetail(@Request() req, @Param('id') id: string) {
    const accountCompany = req.account;
    return this.companyService.getJobDetail(accountCompany, id);
  }
  @Patch('job/edit/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  @UseInterceptors(FilesInterceptor('images', 12))
  async patchJobDetail(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: updateJobDto,
    @Request() req,
    @Param('id') id: string) {
    let uploadedImages: string[] = [];

    if (images && images.length > 0) {
      const uploadPromises = images.map(file => this.cloudinary.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map(r => r.secure_url);
    }

    return this.companyService.patchJobDetail(req.account, body, id, uploadedImages);
  }

  @Delete('job/delete/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async deleteJob(@Request() req, @Param('id') id: string) {
    return this.companyService.deleteJob(req.account, id);
  }

  @Patch('job/change-display/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async changeDisplay(@Request() req, @Param('id') id: string) {
    return this.companyService.changeDisplay(req.account, id);
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
  async cvList(@Request() req, @Query('page') page?: string) {
    return this.companyService.cvList(req.account.id, page);
  }
  @Get('cv/detail/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async cvDetail(@Param('id') id: string, @Request() req) {
    return this.companyService.cvDetail(id, req.account.id);
  }

  @Patch('cv/change-status')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async changeStatusPatch(@Request() req, @Body() body: changeStatusDto) {
    return this.companyService.changeStatusPatch(body, req.account.id);
  }
  @Delete('cv/delete/:id')
  @UseGuards(JwtAuthGuard, EmployerGuard)
  async deleteCV(@Request() req, @Param('id') id: string) {
    return this.companyService.deleteCV(req.account.id, id);
  }

}