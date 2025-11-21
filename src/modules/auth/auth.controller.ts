import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';

import { JwtService } from '@nestjs/jwt';
import { loginDto, registerCompanyDto, registerUserDto } from './dto/auth.dto';
@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';
  constructor(private readonly authService: AuthService,
    private jwtService: JwtService
  ) { }
  private async handleOldTokens(req: Request, res: Response) {
    const oldAccessToken = req.cookies['accessToken'];
    const oldRefreshToken = req.cookies['refreshToken'];

    if (oldAccessToken || oldRefreshToken) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (oldRefreshToken) {
        try {
          const payload = this.jwtService.verify(oldRefreshToken);
          await this.authService.clearOldTokensInDB(payload.id);
        } catch { }
      }
    }
  }
  @Post('company/login')
  async loginCompany(
    @Body() loginDto: loginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.handleOldTokens(req, res);
    const tokens = await this.authService.loginCompany(loginDto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { message: "Login successful!" };
  }
  @Post('company/register')
  async registerCompany(@Body() registerCompanyDto: registerCompanyDto) {
    return this.authService.registerCompany(registerCompanyDto);
  }

  @Post('user/login')
  async loginUser(
    @Body() loginDto: loginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.handleOldTokens(req, res);

    const tokens = await this.authService.loginUser(loginDto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { message: "Login successful!" };
  }

  @Post('user/register')
  async register(@Body() registerUserDto: registerUserDto) {
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
    const token = req.cookies['refreshToken'];
    await this.authService.logoutFromDB(token);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { code: 'success', message: 'Signed out!' };
  }
}
