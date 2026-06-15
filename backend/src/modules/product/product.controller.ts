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

import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CreateProductDto } from '@/modules/product/dto/create-product.dto';
import { ProductListQueryDto } from '@/modules/product/dto/product-list-query.dto';
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto';
import { ProductService } from '@/modules/product/product.service';

@ApiTags('Product')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('admin/products')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get product list for admin' })
  getAdminList(@Query() query: ProductListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/products/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get product detail for admin' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/products')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch('admin/products/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/products/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update product status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/products/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
