import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" }
    })
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule { }