import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { AboutService } from '@/modules/about/about.service';

@ApiTags('About')
@Controller('v1/about')
export class AboutPublicController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all about page content' })
  getPublicAbout() {
    return this.aboutService.getPublicAbout();
  }
}
