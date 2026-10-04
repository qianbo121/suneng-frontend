import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { submitSingleUrlToBaidu } from './baidu-submit-response';

@Injectable()
export class BaiduSubmitService {
  private readonly logger = new Logger(BaiduSubmitService.name);
  private hasWarnedMissingConfig = false;

  constructor(private readonly configService: ConfigService) {}

  buildNewsUrl(slug: string) {
    const publicSiteUrl =
      this.configService.get<string>('publicSiteUrl') ?? 'https://www.jssngyl.cn';
    return `${publicSiteUrl.replace(/\/+$/, '')}/zh/news/${encodeURIComponent(slug)}`;
  }

  async submitUrl(url: string) {
    const site = this.configService.get<string>('baiduSite')?.trim();
    const token = this.configService.get<string>('baiduToken')?.trim();
    if (!site || !token) {
      if (!this.hasWarnedMissingConfig) {
        this.logger.warn('Baidu submit skipped: BAIDU_SITE or BAIDU_TOKEN is missing');
        this.hasWarnedMissingConfig = true;
      }
      return false;
    }
    await submitSingleUrlToBaidu(site, token, url);
    this.logger.log('Baidu accepted one news URL for discovery');
    return true;
  }
}
