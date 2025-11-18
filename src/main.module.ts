import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/companies/company.module';
import { CityModule } from './modules/cities/city.module';
import { UploadModule } from './core/uploads/upload.module';
import { SearchModule } from './modules/searches/search.module';


@Module({
  imports: [PrismaModule, UploadModule, SearchModule, CityModule, UserModule, CompanyModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
