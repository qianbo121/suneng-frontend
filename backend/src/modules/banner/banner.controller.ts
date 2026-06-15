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
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { BannerListQueryDto } from '@/modules/banner/dto/banner-list-query.dto';
import { CreateBannerDto } from '@/modules/banner/dto/create-banner.dto';
import { UpdateBannerDto } from '@/modules/banner/dto/update-banner.dto';
import { BannerService } from '@/modules/banner/banner.service';

@ApiTags('Banner')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('v1/banners')
  @Public()
  @ApiOperation({ summary: 'Get published active banners' })
  getPublicList() {
    return this.bannerService.getPublicList();
  }

  @Get('admin/banners')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get banner list for admin' })
  getAdminList(@Query() query: BannerListQueryDto) {
    return this.bannerService.getAdminList(query);
  }

  @Get('admin/banners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get banner detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Post('admin/banners')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create banner' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @Patch('admin/banners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update banner' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }

  @Patch('admin/banners/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update banner status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.bannerService.updateStatus(id, dto.status);
  }

  @Delete('admin/banners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete banner' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.remove(id);
  }
}
