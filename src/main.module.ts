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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, cloudinaryConfig, googleConfig],
    }),
    PrismaModule, UploadModule, SearchModule, CityModule, UserModule, CompanyModule, AuthModule, JobModule],
  controllers: [],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },],
})
export class AppModule { }
