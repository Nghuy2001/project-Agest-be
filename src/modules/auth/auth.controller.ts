import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { Response } from 'express';


@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Get('check')
  async check(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      return this.authService.check(req.account);
    } catch (error) {
      res.clearCookie('token');
      throw error;
    }
  }
  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

}
