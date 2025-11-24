import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { loginDto, registerCompanyDto, registerUserDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';
  constructor(private readonly authService: AuthService,
    private jwtService: JwtService
  ) { }
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  private generateState(role: 'candidate' | 'employer', redirectTo: string) {
    return this.jwtService.sign({ role, redirectTo }, {
      secret: process.env.JWT_SECRET!,
      expiresIn: '5m',
    });
  }

  private verifyState(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET!,
    });
  }

  private async handleOldTokens(req: Request, res: Response) {
    const oldAccessToken = req.cookies['accessToken'];
    const oldRefreshToken = req.cookies['refreshToken'];

    if (oldAccessToken || oldRefreshToken) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (oldRefreshToken) {
        try {
          const payload = this.jwtService.verify(oldRefreshToken);
          await this.authService.clearOldTokensInDB(payload.id, payload.role);
        } catch { }
      }
    }
  }

  @Get('google')
  async googleAuth(@Query('role') role: 'candidate' | 'employer', @Res() res) {
    if (!['candidate', 'employer'].includes(role)) {
      return res.status(400).send('Invalid role');
    }
    const state = this.generateState(role, process.env.FE_URL!);
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}` +
      `&response_type=code&scope=openid%20email%20profile` +
      `&state=${state}`;


    return res.redirect(url);
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res) {
    const { state } = req.query;

    await this.handleOldTokens(req, res);
    if (!state) return res.status(400).send('Missing state');


    let decoded;
    try {
      decoded = this.verifyState(state);
    } catch (e) {
      return res.status(400).send('Invalid state');
    }


    const role = decoded.role;
    const redirectTo = decoded.redirectTo;
    const userGoogle = req.user;
    const tokens = await this.authService.handleGoogleLogin(userGoogle, role);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)

    return res.redirect(redirectTo);
  }



  @Post('company/login')
  async loginCompany(
    @Body() loginDto: loginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.handleOldTokens(req, res);
    const tokens = await this.authService.loginCompany(loginDto);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
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
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)

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
