import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { googleAuthQueryDto, loginDto, registerCompanyDto, registerUserDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './types/auth.type';
import { AUTH_COOKIE, ENV, TOKEN_EXPIRATION } from 'src/core/constants/auth.constants';
@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';
  constructor(private readonly authService: AuthService,
    private jwtService: JwtService
  ) { }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(AUTH_COOKIE.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION.ACCESS,
    });

    res.cookie(AUTH_COOKIE.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION.REFRESH,
    });
  }
  private generateState(role: UserRole, redirectTo: string) {
    return this.jwtService.sign({ role, redirectTo }, {
      secret: ENV.JWT_SECRET,
      expiresIn: '5m',
    });
  }

  private verifyState(token: string) {
    return this.jwtService.verify(token, {
      secret: ENV.JWT_SECRET,
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
  private getSafeRedirectUrl(redirectTo?: string): string {
    const base = ENV.FE_URL;

    if (!redirectTo) return base;

    try {
      const redirectUrl = new URL(redirectTo, base);
      const baseUrl = new URL(base);

      const isSameOrigin =
        redirectUrl.origin === baseUrl.origin &&
        redirectUrl.href.startsWith(baseUrl.href);

      return isSameOrigin ? redirectUrl.href : base;
    } catch {
      return base;
    }
  }
  @Get('google')
  async googleAuth(@Query() query: googleAuthQueryDto, @Res() res: Response) {
    const { role } = query;
    const redirectTo = this.getSafeRedirectUrl(ENV.FE_URL);
    const state = this.generateState(role, redirectTo);
    const params = new URLSearchParams({
      client_id: ENV.GOOGLE_CLIENT_ID,
      redirect_uri: ENV.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;


    return res.redirect(url);
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const { state } = req.query;

    await this.handleOldTokens(req, res);
    if (!state) return res.status(400).send('Missing state');

    if (typeof state !== 'string') {
      return res.status(400).send('Missing state');
    }
    let decoded: { role: UserRole; redirectTo: string };
    try {
      decoded = this.verifyState(state);
    } catch (e) {
      return res.status(400).send('Invalid state');
    }


    const role = decoded.role;
    const redirectTo = this.getSafeRedirectUrl(decoded.redirectTo);
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
