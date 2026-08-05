import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type FeishuWebhookResponse = {
  code?: number;
  msg?: string;
  StatusCode?: number;
  StatusMessage?: string;
};

const INQUIRY_NOTIFICATION_TITLE = '官网新询盘';
const MAX_SENDER_LENGTH = 300;
const MAX_BODY_LENGTH = 4_000;

type InquiryNotificationPayload = {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  industry?: string | null;
  process?: string | null;
  temperature?: string | null;
  requirement?: string | null;
  createdAt?: Date | string | null;
};

function cleanInline(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim();
}

function cleanBody(value?: string | null) {
  return value?.replace(/\0/g, '').replace(/\r\n?/g, '\n').trim();
}

function escapeLarkMarkdown(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([\\`*_~[\]])/g, '\\$1');
}

function field(label: string, value?: string | null) {
  const cleaned = cleanInline(value)?.slice(0, MAX_SENDER_LENGTH);
  if (!cleaned) return undefined;

  return {
    is_short: true,
    text: {
      tag: 'lark_md',
      content: `**${label}**\n${escapeLarkMarkdown(cleaned)}`,
    },
  };
}

function formatReceivedAt(value?: Date | string | null) {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '未填写';

  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`;
}

function buildInquiryCard(inquiry: InquiryNotificationPayload) {
  const requirement = cleanBody(inquiry.requirement)?.slice(0, MAX_BODY_LENGTH);
  const fields = [
    field('来源', '官网询盘'),
    field('收到时间', formatReceivedAt(inquiry.createdAt)),
    field('联系人', inquiry.name),
    field('公司', inquiry.company),
    field('联系电话', inquiry.phone),
    field('所属行业', inquiry.industry),
    field('设备工艺', inquiry.process),
    field('使用温度', inquiry.temperature),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
  const elements: Record<string, unknown>[] = [{ tag: 'div', fields }];

  if (requirement) {
    elements.push(
      { tag: 'hr' },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**设备需求**\n${escapeLarkMarkdown(requirement)}`,
        },
      },
    );
  }

  return {
    config: { wide_screen_mode: true },
    header: {
      template: 'orange',
      title: { tag: 'plain_text', content: INQUIRY_NOTIFICATION_TITLE },
    },
    elements,
  };
}

@Injectable()
export class InquiryNotificationService {
  private readonly logger = new Logger(InquiryNotificationService.name);
  private hasWarnedMissingWebhook = false;

  constructor(private readonly configService: ConfigService) {}

  async notifyNewInquiry(inquiry: InquiryNotificationPayload) {
    const webhookUrl = this.configService.get<string>('feishuInquiryWebhookUrl')?.trim();

    if (!webhookUrl) {
      if (!this.hasWarnedMissingWebhook) {
        this.logger.warn('Inquiry notification skipped: FEISHU_INQUIRY_WEBHOOK_URL is missing');
        this.hasWarnedMissingWebhook = true;
      }
      return false;
    }

    let response: Response;
    try {
      response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'interactive',
          card: buildInquiryCard(inquiry),
        }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      throw new Error('Feishu inquiry notification request failed');
    }

    if (!response.ok) {
      throw new Error(`Feishu inquiry notification returned HTTP ${response.status}`);
    }

    const result = await this.parseResponse(response);
    const responseCode = result?.code ?? result?.StatusCode;
    if (responseCode !== undefined && responseCode !== 0) {
      throw new Error(`Feishu inquiry notification returned error ${responseCode}`);
    }

    return true;
  }

  private async parseResponse(response: Response) {
    const responseText = await response.text();
    if (!responseText) return undefined;

    try {
      return JSON.parse(responseText) as FeishuWebhookResponse;
    } catch {
      return undefined;
    }
  }
}
