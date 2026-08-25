'use client';

import { FormEvent, useRef, useState } from 'react';
import { HiCheck } from 'react-icons/hi2';

import {
  getFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
  renewFormIdempotencyKey,
} from '@/lib/api/custom-requirements';
import {
  buildHomepageRequirementPayload,
  type HomepageRequirementField,
  type HomepageRequirementValues,
  submitHomepageRequirement,
  validateHomepageRequirement,
} from '@/lib/api/homepage-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';

import styles from './HomepageV2.module.css';

const emptyValues: HomepageRequirementValues = {
  direction: '',
  problem: '',
  identity: '',
  contact: '',
};

const fieldLabels: Record<HomepageRequirementField, string> = {
  direction: '项目方向',
  problem: '当前最主要的问题',
  identity: '企业或联系人',
  contact: '联系方式',
};

const initialResults = [
  ['热处理线', '得到初步工程范围'],
  ['单台工业炉', '得到初步选型方向'],
  ['现有炉', '判断维修、改造、换新或补资料'],
] as const;

export function HomepageLeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const formStartedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const [values, setValues] = useState<HomepageRequirementValues>(emptyValues);
  const [invalidField, setInvalidField] = useState<HomepageRequirementField | null>(null);
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (field: HomepageRequirementField, value: string) => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackLeadEvent('form_start', { pageType: '首页', productTag: '热处理生产线与工业炉' });
    }
    setValues((current) => ({ ...current, [field]: value }));
    if (invalidField === field) setInvalidField(null);
    if (message) setMessage('');
  };

  const focusField = (field: HomepageRequirementField) => {
    requestAnimationFrame(() => {
      const element = formRef.current?.elements.namedItem(field);
      if (element instanceof HTMLElement) element.focus();
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const issue = validateHomepageRequirement(values);
    if (issue) {
      setInvalidField(issue);
      setMessage('');
      focusField(issue);
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      const result = await submitHomepageRequirement(
        buildHomepageRequirementPayload(
          values,
          buildLeadSourceSnapshot({
            pageType: '首页',
            productTag: '热处理生产线与工业炉',
          }),
          getFormIdempotencyKey(idempotencyKeyRef),
        ),
      );
      setSubmissionId(String(result.submissionId));
      renewFormIdempotencyKey(idempotencyKeyRef);
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, idempotencyKeyRef)) {
        setMessage('本次提交编号冲突，已为你刷新，请再提交一次。');
      } else {
        setMessage('暂时没有提交成功，已保留填写内容，请稍后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionId('');
    setValues(emptyValues);
    setInvalidField(null);
    setMessage('');
    formStartedRef.current = false;
    requestAnimationFrame(() => {
      const element = formRef.current?.elements.namedItem('direction');
      if (element instanceof HTMLElement) element.focus();
    });
  };

  return (
    <section
      id="homepage-lead-form"
      className={styles.formSection}
      aria-labelledby="homepage-form-title"
    >
      <div className={styles.formInner}>
        <div className={styles.formIntro}>
          <h2 id="homepage-form-title">资料不全，也可以先开始</h2>
          <p>
            项目方向不同，首次沟通的输出也不同。先提交四项基本信息，图纸和完整参数可以随后补充。
          </p>
          <div className={styles.formPathList}>
            {initialResults.map(([title, result]) => (
              <div key={title}>
                <strong>{title}</strong>
                <span>{result}</span>
              </div>
            ))}
          </div>
          <p className={styles.formBoundary}>
            初步范围或方向不是正式技术方案、最终报价或合同承诺；需要补资料或现场勘查时会明确说明。
          </p>
        </div>

        {submissionId ? (
          <div className={styles.successPanel} role="status" aria-live="polite">
            <span className={styles.successIcon} aria-hidden="true">
              <HiCheck />
            </span>
            <div>
              <span className={styles.successEyebrow}>提交成功</span>
              <h3>项目情况已经收到</h3>
              <p>
                我们会先按项目方向核对已提交信息，并给出可继续沟通的初步范围或方向。需要补资料或现场勘查时会明确说明。
              </p>
            </div>
            <dl className={styles.successDetails}>
              <div>
                <dt>需求编号</dt>
                <dd>{submissionId}</dd>
              </div>
              <div>
                <dt>已记录</dt>
                <dd>项目方向、当前问题、公司或联系人、联系方式</dd>
              </div>
              <div>
                <dt>下一步</dt>
                <dd>核对项目方向与资料完整度，准备初步范围或选型方向</dd>
              </div>
            </dl>
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              提交另一个项目
            </button>
          </div>
        ) : (
          <form ref={formRef} className={styles.leadForm} onSubmit={handleSubmit} noValidate>
            <p className={styles.privacyNote}>
              开始填写后，我们会记录必要的页面与来源信息，用于判断官网是否真正帮助了你。
            </p>
            {message ? (
              <p className={styles.formMessage} role="alert">
                {message}
              </p>
            ) : null}

            <label className={styles.field}>
              <span>1. 项目方向</span>
              <select
                name="direction"
                value={values.direction}
                onChange={(event) => updateValue('direction', event.target.value)}
                autoComplete="off"
                aria-describedby={invalidField === 'direction' ? 'direction-error' : undefined}
                aria-invalid={invalidField === 'direction' || undefined}
              >
                <option value="">请选择项目方向</option>
                <option value="新建热处理生产线">新建热处理生产线</option>
                <option value="单体工业炉新建">单体工业炉新建</option>
                <option value="现有工业炉维修、改造或换新判断">
                  现有工业炉维修、改造或换新判断
                </option>
                <option value="售后、选型或其他">售后、选型或其他</option>
              </select>
              {invalidField === 'direction' ? (
                <span id="direction-error" className={styles.fieldError} aria-live="polite">
                  请填写有效的{fieldLabels.direction}。
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>2. 当前情况或主要问题</span>
              <textarea
                name="problem"
                value={values.problem}
                onChange={(event) => updateValue('problem', event.target.value)}
                placeholder="例如：工件、产量、工艺要求，或现有设备遇到的问题…"
                autoComplete="off"
                maxLength={8_000}
                aria-describedby={invalidField === 'problem' ? 'problem-error' : undefined}
                aria-invalid={invalidField === 'problem' || undefined}
              />
              {invalidField === 'problem' ? (
                <span id="problem-error" className={styles.fieldError} aria-live="polite">
                  请填写有效的{fieldLabels.problem}。
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>3. 公司或联系人</span>
              <input
                name="identity"
                type="text"
                value={values.identity}
                onChange={(event) => updateValue('identity', event.target.value)}
                placeholder="例如：江苏某公司 / 张工…"
                autoComplete="organization"
                maxLength={180}
                aria-describedby={invalidField === 'identity' ? 'identity-error' : undefined}
                aria-invalid={invalidField === 'identity' || undefined}
              />
              {invalidField === 'identity' ? (
                <span id="identity-error" className={styles.fieldError} aria-live="polite">
                  请填写有效的{fieldLabels.identity}。
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>4. 联系方式（填一种即可）</span>
              <input
                name="contact"
                type="text"
                value={values.contact}
                onChange={(event) => updateValue('contact', event.target.value)}
                placeholder="例如：手机 / 微信 / 邮箱…"
                autoComplete="off"
                spellCheck={false}
                maxLength={254}
                aria-describedby={invalidField === 'contact' ? 'contact-error' : undefined}
                aria-invalid={invalidField === 'contact' || undefined}
              />
              {invalidField === 'contact' ? (
                <span id="contact-error" className={styles.fieldError} aria-live="polite">
                  请填写有效的{fieldLabels.contact}。
                </span>
              ) : null}
            </label>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? '正在提交…' : '提交项目情况'}
            </button>
            <p className={styles.formFootnote}>
              图纸、工艺曲线、能耗和完整参数，可在提交后按项目方向逐步补充。
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
