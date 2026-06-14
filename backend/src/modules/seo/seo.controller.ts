import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

import { Public } from '@/common/decorators/public.decorator';
import { CreateSeoDto } from '@/modules/seo/dto/create-seo.dto';
import { PublicSeoQueryDto } from '@/modules/seo/dto/public-seo-query.dto';
import { SeoListQueryDto } from '@/modules/seo/dto/seo-list-query.dto';
import { UpdateSeoDto } from '@/modules/seo/dto/update-seo.dto';
import { SeoService } from '@/modules/seo/seo.service';

@ApiTags('SEO')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('v1/seo')
  @Public()
  @ApiOperation({ summary: 'Get SEO metadata by page key' })
  getPublicByPageKey(@Query() query: PublicSeoQueryDto) {
    return this.seoService.getPublicByPageKey(query.pageKey);
  }

  @Get('admin/seo')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get SEO list for admin' })
  getAdminList(@Query() query: SeoListQueryDto) {
    return this.seoService.getAdminList(query);
  }

  @Get('admin/seo/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get SEO detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seoService.findOne(id);
  }

  @Post('admin/seo')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create SEO metadata' })
  create(@Body() dto: CreateSeoDto) {
    return this.seoService.create(dto);
  }

  @Patch('admin/seo/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update SEO metadata' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSeoDto) {
    return this.seoService.update(id, dto);
  }

  @Delete('admin/seo/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete SEO metadata' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seoService.remove(id);
  }
}
