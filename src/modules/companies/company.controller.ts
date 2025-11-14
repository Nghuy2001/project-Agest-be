import { Body, Controller, Post, Res } from '@nestjs/common';
import { CompanyService } from './company.service';
import { LoginDto, RegisterDto } from './dto/company.dto';
import type { Response } from 'express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.companyService.register(registerDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.companyService.login(loginDto, res);
  }
}