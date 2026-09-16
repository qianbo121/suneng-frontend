'use client';

import Link from 'next/link';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { trackLeadEvent } from '@/lib/api/lead-events';

export function CaseContact({
  position,
  caseId,
  label = '加微信，工况初判',
}: {
  position: string;
  caseId?: string;
  label?: string;
}) {
  return (
    <span
      className="case-contact-button"
      onClickCapture={(event) => {
        // Portal clicks bubble through React; only count the actual trigger in this span.
        if (event.currentTarget.contains(event.target as Node)) {
          trackLeadEvent('wechat_click', {
            pageType: 'case',
            properties: { position, caseId: caseId ?? 'list' },
          });
        }
      }}
    >
      <WechatContactButton label={label} className="case-button case-button-primary" />
    </span>
  );
}

export function CaseMobileContact({ caseId }: { caseId?: string }) {
  return (
    <div className="case-mobile-contact" aria-label="项目咨询">
      <a
        href="tel:13052986814"
        onClick={() =>
          trackLeadEvent('phone_click', {
            pageType: 'case',
            properties: { caseId: caseId ?? 'list', position: 'mobile' },
          })
        }
      >
        电话咨询
      </a>
      <CaseContact position="mobile" caseId={caseId} />
    </div>
  );
}

export function CaseContactBand({ detail = false, caseId }: { detail?: boolean; caseId?: string }) {
  return (
    <section className="case-contact-band" aria-label="咨询相似工况">
      <div>
        <h2>{detail ? '有相似工况，先把需求聊清楚。' : '没找到相似项目？'}</h2>
        <p>
          {detail
            ? '工件、装载、温度或已有方案，都可以作为沟通起点。'
            : '先发工件、工况或旧炉照片，聊清楚需要解决的问题。'}
        </p>
      </div>
      <div className="case-band-actions">
        <CaseContact position="bottom" caseId={caseId} />
        <Link className="case-button case-button-outline" href="/zh/products">
          查看产品中心
        </Link>
      </div>
    </section>
  );
}
