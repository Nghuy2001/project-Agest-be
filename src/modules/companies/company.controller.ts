import { Body, Controller, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RegisterDto } from './dto/company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.companyService.register(registerDto);
  }

}