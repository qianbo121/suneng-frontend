'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useRef } from 'react';

import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { trackLeadEvent, type LeadEventType } from '@/lib/api/lead-events';

import styles from './FurnaceRenovationPage.module.css';

type RenovationCtaProps = {
  href: string;
  eventName: string;
  eventType?: LeadEventType;
  intentName?: string;
  className: string;
  children: ReactNode;
};

function recordServiceEvent(eventType: LeadEventType, eventName: string, intentName?: string) {
  trackLeadEvent(eventType, {
    properties: {
      eventName,
      ...(intentName ? { intentName } : {}),
    },
  });
}

export function RenovationCta({
  href,
  eventName,
  eventType = 'cta_click',
  intentName,
  className,
  children,
}: RenovationCtaProps) {
  return (
    <a
      href={href}
      className={className}
      data-service-event={eventName}
      onClick={() => recordServiceEvent(eventType, eventName, intentName)}
    >
      {children}
    </a>
  );
}

export function RenovationFormDialog({ className }: { className: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openDialog = () => {
    recordServiceEvent('cta_click', 'service_reno_bottom_contact');
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        data-service-event="service_reno_bottom_contact"
        onClick={openDialog}
      >
        提交工况，获取工程判断
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="提交工业炉改造工况"
        onClick={closeOnBackdrop}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className={styles.dialogInner}>
          <button
            type="button"
            className={styles.dialogClose}
            aria-label="关闭工况提交窗口"
            onClick={closeDialog}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <ProductLeadForm
            anchorId="service-renovation-lead-form"
            title="提交工况，获取工程判断"
            description="先填写炉型或设备名称、当前主要问题、最高使用温度、能源形式和联系方式。资料不必一次填全，工程师会再确认需要补充的内容。"
            className={styles.dialogForm}
          />
          <p className={styles.dialogSafety}>
            照片请通过页面中的真实微信二维码发送。请在设备停机并确认安全后拍摄；不得打开带电电控柜门，不得进入未冷却炉膛或受限空间。
          </p>
        </div>
      </dialog>
    </>
  );
}
