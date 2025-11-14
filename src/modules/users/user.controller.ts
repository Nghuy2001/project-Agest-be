import { Body, Controller, Patch, Post, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, RegisterDto } from './dto/user.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from 'src/core/common/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: any,
    @Request() req
  ) {
    let uploadedImage: UploadApiResponse | null = null;
    if (avatar) {
      uploadedImage = await this.cloudinary.uploadImage(avatar);
    }

    return this.userService.updateProfile(body, req, uploadedImage?.secure_url || undefined);
  }
}
