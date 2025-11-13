import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, RegisterDto } from './dto/user.dto';
import type { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response) {
    return this.userService.login(loginDto, res);
  }
}
