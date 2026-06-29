import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from '@/app.controller';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminUserModule } from '@/modules/admin-user/admin-user.module';
import { UploadModule } from '@/modules/upload/upload.module';
import { BannerModule } from '@/modules/banner/banner.module';
import { ProductCategoryModule } from '@/modules/product-category/product-category.module';
import { ProductModule } from '@/modules/product/product.module';
import { NewsCategoryModule } from '@/modules/news-category/news-category.module';
import { NewsModule } from '@/modules/news/news.module';
import { PartnerModule } from '@/modules/partner/partner.module';
import { AboutModule } from '@/modules/about/about.module';
import { CustomRequirementModule } from '@/modules/custom-requirement/custom-requirement.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { PrismaModule } from '@/prisma/prisma.module';
import configuration from '@/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    AdminUserModule,
    UploadModule,
    BannerModule,
    ProductCategoryModule,
    ProductModule,
    NewsCategoryModule,
    NewsModule,
    PartnerModule,
    AboutModule,
    CustomRequirementModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
