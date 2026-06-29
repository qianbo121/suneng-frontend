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
import { CreateProductCategoryDto } from '@/modules/product-category/dto/create-product-category.dto';
import { ProductCategoryListQueryDto } from '@/modules/product-category/dto/product-category-list-query.dto';
import { UpdateProductCategoryDto } from '@/modules/product-category/dto/update-product-category.dto';
import { ProductCategoryService } from '@/modules/product-category/product-category.service';

@ApiTags('Product Category')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Get('v1/product-categories')
  @Public()
  @ApiOperation({ summary: 'Get published product categories' })
  getPublicList() {
    return this.service.getPublicList();
  }

  @Get('admin/product-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get product category list for admin' })
  getAdminList(@Query() query: ProductCategoryListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/product-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get product category detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/product-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create product category' })
  create(@Body() dto: CreateProductCategoryDto) {
    return this.service.create(dto);
  }

  @Patch('admin/product-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update product category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductCategoryDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/product-categories/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update product category status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/product-categories/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete product category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
