import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateGuard } from './guards/user.guard';
import { updateProfileDto } from './dto/user.dto';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private cloudinary: CloudinaryService,
  ) { }


  @Patch('profile')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: updateProfileDto,
    @Req() req: Request
  ) {
    const uploadedImage = avatar ? await this.cloudinary.uploadImage(avatar) : null;

    return await this.userService.updateProfile(
      body,
      req.account,
      uploadedImage?.secure_url,
    );
  }
  @Get('cv/list')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async getCVList(
    @Req() req: Request,
    @Query("page") page?: string
  ) {
    return this.userService.getCVList(req.account, page)
  }
  @Get('cv/detail/:id')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async cvDetail(@Param('id') id: string, @Req() req: Request) {
    return this.userService.cvDetail(id, req.account.id)
  }

  @Delete('cv/delete/:id')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async deleteCV(@Req() req: Request, @Param('id') id: string) {
    return this.userService.deleteCV(req.account.id, id);
  }
}
