import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { loginDto, registerCompanyDto, registerUserDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  async clearOldTokensInDB(accountId: string) {
    await this.prisma.accountsUser.updateMany({
      where: { id: accountId },
      data: { refreshToken: null },
    });

    await this.prisma.accountCompany.updateMany({
      where: { id: accountId },
      data: { refreshToken: null },
    });
  }
  async loginCompany(data: loginDto) {
    const { email, password } = data;
    const companyExists = await this.prisma.accountCompany.findUnique({
      where: { email },
    });

    if (!companyExists) throw new BadRequestException("Email does not exist!");
    if (companyExists.role !== "employer") throw new ForbiddenException("No permission");

    const isPasswordValid = await bcrypt.compare(password, companyExists.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

    const payload = { id: companyExists.id, email: companyExists.email, role: companyExists.role };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    await this.prisma.accountCompany.update({
      where: { id: companyExists.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
  async loginUser(data: loginDto) {
    const { email, password } = data;

    const userExists = await this.prisma.accountsUser.findUnique({
      where: { email },
    });

    if (!userExists) throw new BadRequestException("Email does not exist!");
    if (userExists.role !== "candidate") throw new ForbiddenException("No permission");

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) throw new UnauthorizedException("Incorrect password");

    const payload = { id: userExists.id, email: userExists.email, role: userExists.role };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    await this.prisma.accountsUser.update({
      where: { id: userExists.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
  async registerCompany(data: registerCompanyDto) {
    const { companyName, email, password } = data
    const existsCompany = await this.prisma.accountCompany.findUnique({
      where: { email: email },
    });

    if (existsCompany) {
      throw new BadRequestException("Email already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.accountCompany.create({
      data: {
        email: email,
        password: hashedPassword,
        companyName: companyName,
        role: 'employer'
      },
    });

    return { message: "Registration successful!" };
  }
  async registerUser(data: registerUserDto) {
    const existingUser = await this.prisma.accountsUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    await this.prisma.accountsUser.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: 'candidate'
      },
    });

    return { message: "Registration successful!" };
  }
  async check(accountPayload: any) {
    if (!accountPayload) {
      throw new UnauthorizedException('Invalid Token!');
    }

    const id = accountPayload.id;
    const user = await this.prisma.accountsUser.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        phone: true
      },
    });

    if (user) return { infoUser: user };
    const company = await this.prisma.accountCompany.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        email: true,
        cityId: true,
        address: true,
        companyModel: true,
        companyEmployees: true,
        workingTime: true,
        workOvertime: true,
        description: true,
        logo: true,
        phone: true
      },
    });
    if (company) return { infoCompany: company };

    throw new UnauthorizedException('Invalid Token!');
  }
  async logoutFromDB(refreshToken: string) {
    if (!refreshToken) return;
    await this.prisma.accountCompany.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
    await this.prisma.accountsUser.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });
  }
}
