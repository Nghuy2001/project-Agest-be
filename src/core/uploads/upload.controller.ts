import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) { }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToCloudinary(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);

    console.log(result)
    return {
      location: result.secure_url,
    };
  }
}
