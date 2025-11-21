import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';
import { LoginDto, RegisterCompanyDto, RegisterUserDto } from './dto/auth.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('company/login')
  async loginCompany(@Body() LoginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.authService.loginCompany(LoginDto, res);
  }
  @Post('company/register')
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto) {
    return this.authService.registerCompany(registerCompanyDto);
  }

  @Post('user/login')
  async loginUser(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.authService.loginUser(loginDto, res);
  }

  @Post('user/register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto,);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async check(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      return this.authService.check(req.account);
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      console.log(error)
      throw error;
    }
  }
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

}
