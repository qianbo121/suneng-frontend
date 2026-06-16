'use client';

import { useState } from 'react';

type CopyQuoteChecklistButtonProps = {
  text: string;
  label?: string;
  className?: string;
  wrapperClassName?: string;
  messageClassName?: string;
};

const successMessage = '报价资料清单已复制，可发送给苏能技术人员。';
const defaultLabel = '复制报价资料清单（可直接发送给苏能）';
const defaultWrapperClassName = 'mt-5';
const defaultButtonClassName =
  'inline-flex min-h-[42px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[14px] font-semibold text-white transition hover:bg-[#a90f1b]';
const defaultMessageClassName =
  'mt-3 block rounded-[6px] border border-white/16 bg-white/10 px-4 py-3 text-[14px] leading-[1.7] text-white/88';

export function CopyQuoteChecklistButton({
  text,
  label = defaultLabel,
  className,
  wrapperClassName = defaultWrapperClassName,
  messageClassName = defaultMessageClassName,
}: CopyQuoteChecklistButtonProps) {
  const [message, setMessage] = useState('');

  const copyWithFallback = async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to the textarea fallback for browsers that block clipboard permissions.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copiedFromTextarea = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (copiedFromTextarea) {
      return true;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    const textNode = document.createElement('span');
    textNode.textContent = text;
    textNode.style.position = 'fixed';
    textNode.style.left = '0';
    textNode.style.top = '0';
    textNode.style.opacity = '0';
    textNode.style.whiteSpace = 'pre';
    textNode.style.userSelect = 'text';
    document.body.appendChild(textNode);

    const range = document.createRange();
    range.selectNodeContents(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    const copiedFromRange = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(textNode);

    return copiedFromRange;
  };

  const handleCopy = async () => {
    try {
      const copied = await copyWithFallback();
      setMessage(copied ? successMessage : '复制失败，请手动选中清单内容复制。');
    } catch {
      setMessage('复制失败，请手动选中清单内容复制。');
    }
  };

  return (
    <div className={wrapperClassName}>
      <button type="button" onClick={handleCopy} className={className ?? defaultButtonClassName}>
        {label}
      </button>
      {message ? (
        <p className={messageClassName} aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}
