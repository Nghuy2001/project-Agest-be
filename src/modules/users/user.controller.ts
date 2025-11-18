import { BadRequestException, Body, Controller, Patch, Post, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/user.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateGuard } from './guards/user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private cloudinary: CloudinaryService,
  ) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto,);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.userService.login(loginDto, res);
  }
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

}
