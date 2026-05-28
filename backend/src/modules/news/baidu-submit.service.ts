import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type BaiduSubmitResponse = {
  success?: number;
  remain?: number;
  error?: number;
  message?: string;
};

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

    const endpoint = new URL('http://data.zz.baidu.com/urls');
    endpoint.searchParams.set('site', site);
    endpoint.searchParams.set('token', token);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: url,
      });
    } catch {
      throw new Error('Baidu submit request failed');
    }

    const responseText = await response.text();
    const parsed = this.parseResponse(responseText);

    if (!response.ok) {
      throw new Error(`Baidu submit returned HTTP ${response.status}`);
    }

    if (parsed?.error !== undefined) {
      throw new Error(
        `Baidu submit returned error ${parsed.error}: ${parsed.message ?? 'unknown error'}`,
      );
    }

    this.logger.log(`Baidu submitted news URL: ${url}`);
    return true;
  }

  private parseResponse(responseText: string) {
    if (!responseText) return undefined;

    try {
      return JSON.parse(responseText) as BaiduSubmitResponse;
    } catch {
      return undefined;
    }
  }
}
