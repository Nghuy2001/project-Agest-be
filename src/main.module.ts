import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/companies/company.module';
import { CityModule } from './modules/cities/city.module';
import { UploadModule } from './core/uploads/upload.module';
import { SearchModule } from './modules/searches/search.module';
import { JobModule } from './modules/jobs/job.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { cloudinaryConfig } from './config/cloudinary.config';
import { googleConfig } from './config/google.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, cloudinaryConfig, googleConfig],
    }),
    PrismaModule, UploadModule, SearchModule, CityModule, UserModule, CompanyModule, AuthModule, JobModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
