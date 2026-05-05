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

import { Public } from '@/common/decorators/public.decorator';
import { CompanyInfoListQueryDto } from '@/modules/company-info/dto/company-info-list-query.dto';
import { CreateCompanyInfoDto } from '@/modules/company-info/dto/create-company-info.dto';
import { UpdateCompanyInfoDto } from '@/modules/company-info/dto/update-company-info.dto';
import { CompanyInfoService } from '@/modules/company-info/company-info.service';

@ApiTags('Company Info')
@Controller()
export class CompanyInfoController {
  constructor(private readonly companyInfoService: CompanyInfoService) {}

  @Get('v1/company-info')
  @Public()
  @ApiOperation({ summary: 'Get all company info key-value pairs' })
  getPublicAll() {
    return this.companyInfoService.getPublicAll();
  }

  @Get('admin/company-info')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get company info list for admin' })
  getAdminList(@Query() query: CompanyInfoListQueryDto) {
    return this.companyInfoService.getAdminList(query);
  }

  @Get('admin/company-info/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get company info detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyInfoService.findOne(id);
  }

  @Post('admin/company-info')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create company info entry' })
  create(@Body() dto: CreateCompanyInfoDto) {
    return this.companyInfoService.create(dto);
  }

  @Patch('admin/company-info/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update company info entry' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyInfoDto) {
    return this.companyInfoService.update(id, dto);
  }

  @Delete('admin/company-info/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete company info entry' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyInfoService.remove(id);
  }
}
