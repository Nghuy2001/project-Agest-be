import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateGuard } from './guards/user.guard';

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
    @Body() body: UpdateProfileDto,
    @Request() req
  ) {
    const uploadedImage = avatar ? await this.cloudinary.uploadImage(avatar) : null;

    const account = req.account;
    return await this.userService.updateProfile(
      body,
      account,
      uploadedImage?.secure_url || undefined,
    );
  }
  @Get('cv/list')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async getCVList(
    @Request() req,
    @Query("page") page?: string
  ) {
    return this.userService.getCVList(req.account, page)
  }
  @Get('cv/detail/:id')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async cvDetail(@Param('id') id: string, @Request() req) {
    return this.userService.cvDetail(id, req.account.id)
  }

  @Delete('cv/delete/:id')
  @UseGuards(JwtAuthGuard, CandidateGuard)
  async deleteCV(@Request() req, @Param('id') id: string) {
    return this.userService.deleteCV(req.account.id, id);
  }
}
