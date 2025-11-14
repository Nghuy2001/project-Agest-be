import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/companies/company.module';


@Module({
  imports: [PrismaModule, UserModule, CompanyModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
