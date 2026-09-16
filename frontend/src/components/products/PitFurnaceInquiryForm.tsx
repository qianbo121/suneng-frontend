'use client';

import { FormEvent, useRef, useState } from 'react';

import {
  buildCustomRequirementPayload,
  getFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
  renewFormIdempotencyKey,
  submitCustomRequirement,
  type ProjectLeadValues,
} from '@/lib/api/custom-requirements';
import { buildLeadSourceSnapshot, trackLeadEvent } from '@/lib/api/lead-events';

import styles from './PitFurnaceDetailPage.module.css';

const technicalFields = [
  ['workpieceName', '工件名称', '例如：传动轴、辊轴、拉杆'],
  ['materialGrade', '材料 / 牌号', '例如：42CrMo'],
  ['maxDimensions', '最大工件尺寸（mm）', '长度 × 直径或完整外形尺寸'],
  ['pieceWeight', '单件质量（kg/件）', '请输入单件最大质量'],
  ['furnaceQuantity', '单炉数量', '请输入每炉件数'],
  ['netLoad', '工件净装载（kg/炉）', '不含随炉料具'],
  ['workingTemperature', '长期工作温度（℃）', '请输入长期工艺温度'],
  ['maximumTemperature', '最高温度（℃）', '请输入项目最高温度'],
  ['holdingTime', '保温时间（min 或 h）', '请同时填写时间单位'],
  ['toolingMass', '随炉料具质量（kg）', '吊具、料架或料筐质量'],
  ['maximumLiftingMass', '最大起吊总质量（kg）', '含工件、料具、吊梁、吊钩与索具'],
  ['loadingMethod', '吊挂、料架或料筐形式', '说明装炉及转移方式'],
  ['coolingMedium', '冷却介质', '例如：空气、油、水或其他'],
] as const;

function fieldValue(formData: FormData, name: string) {
  return String(formData.get(name) || '').trim();
}

function composeRequirement(formData: FormData) {
  const lines = technicalFields.map(([name, label]) => `${label}：${fieldValue(formData, name)}`);
  const effectiveDiameter = fieldValue(formData, 'effectiveDiameter');
  const effectiveHeight = fieldValue(formData, 'effectiveHeight');
  const processCurve = fieldValue(formData, 'processCurve');
  const siteConditions = fieldValue(formData, 'siteConditions');
  const notes = fieldValue(formData, 'notes');

  if (effectiveDiameter) lines.push(`预估有效加热区直径：${effectiveDiameter} mm`);
  if (effectiveHeight) lines.push(`预估有效加热区高度：${effectiveHeight} mm`);
  lines.push(`工艺曲线：${processCurve}`);
  lines.push(`厂房与公用条件：${siteConditions}`);
  if (notes) lines.push(`补充说明：${notes}`);
  lines.push('图纸与工艺文件：当前官网询价接口暂不传输文件，待工程师联系后收取。');
  return lines.join('\n');
}

export function PitFurnaceInquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackLeadEvent('form_start', { pageType: '产品详情', productTag: '井式炉' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const phone = fieldValue(formData, 'phone');
    const email = fieldValue(formData, 'email');
    if (!phone && !email) {
      setMessage('电话 / 微信与邮箱至少填写一项。');
      const phoneField = form.elements.namedItem('phone');
      if (phoneField instanceof HTMLElement) phoneField.focus();
      return;
    }

    const values: ProjectLeadValues = {
      projectType: 'new',
      projectLocation: fieldValue(formData, 'projectLocation'),
      name: fieldValue(formData, 'name'),
      company: fieldValue(formData, 'company'),
      phone,
      email,
      preferredContact: email && !phone ? 'email' : 'phone',
      industry: fieldValue(formData, 'industry'),
      process: fieldValue(formData, 'processCurve'),
      temperature: `${fieldValue(formData, 'workingTemperature')} / ${fieldValue(formData, 'maximumTemperature')} ℃`,
      requirement: composeRequirement(formData),
      discoverySource: '',
    };

    setIsSubmitting(true);
    setMessage('');
    try {
      const result = await submitCustomRequirement(
        buildCustomRequirementPayload(
          values,
          'zh',
          buildLeadSourceSnapshot({ pageType: '产品详情', productTag: '井式炉' }),
          getFormIdempotencyKey(idempotencyKeyRef),
        ),
      );
      setSubmissionId(String(result.submissionId));
      setMessage('项目工况已提交，工程师将根据边界条件继续确认。');
      trackLeadEvent('form_success', { pageType: '产品详情', productTag: '井式炉' });
      renewFormIdempotencyKey(idempotencyKeyRef);
      form.reset();
      startedRef.current = false;
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, idempotencyKeyRef)) {
        setMessage('刚才的版本可能已提交，内容仍然保留；请再次点击提交，作为新版本发送。');
      } else {
        setMessage('暂时没有提交成功，填写内容仍然保留，请稍后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="pit-furnace-inquiry-form"
      ref={formRef}
      className={styles.inquiryForm}
      onSubmit={handleSubmit}
      onChangeCapture={handleStart}
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>公司名称</span>
          <input name="company" required autoComplete="organization" placeholder="请输入公司名称" />
        </label>
        <label className={styles.field}>
          <span>联系人</span>
          <input name="name" required autoComplete="name" placeholder="请输入联系人姓名" />
        </label>
        <label className={styles.field}>
          <span>电话 / 微信</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="与邮箱至少填写一项" />
        </label>
        <label className={styles.field}>
          <span>邮箱</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="与电话至少填写一项"
          />
        </label>
        <label className={styles.field}>
          <span>项目地点 / 交付国家</span>
          <input name="projectLocation" required autoComplete="off" placeholder="例如：江苏泰州" />
        </label>
        <label className={styles.field}>
          <span>行业</span>
          <input name="industry" autoComplete="off" placeholder="例如：机械制造、轴类加工" />
        </label>

        {technicalFields.map(([name, label, placeholder]) => (
          <label key={name} className={styles.field}>
            <span>{label}</span>
            <input
              name={name}
              required
              autoComplete="off"
              inputMode={
                [
                  'pieceWeight',
                  'furnaceQuantity',
                  'netLoad',
                  'workingTemperature',
                  'maximumTemperature',
                  'toolingMass',
                  'maximumLiftingMass',
                ].includes(name)
                  ? 'decimal'
                  : undefined
              }
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>

      <label className={styles.field}>
        <span>工艺曲线</span>
        <textarea
          name="processCurve"
          required
          placeholder="请说明升温、保温、转移与冷却要求；可先填写文字，图纸原文件待工程师联系后收取。"
        />
      </label>

      <label className={styles.field}>
        <span>厂房与公用条件</span>
        <textarea
          name="siteConditions"
          required
          placeholder="请说明行车能力、吊钩最高工作位置距地高度、允许地坑深度、电源或燃气条件。"
        />
      </label>

      <label className={styles.field}>
        <span>补充说明（选填）</span>
        <textarea name="notes" placeholder="可补充质量目标、验收口径、节拍和现场限制。" />
      </label>

      <div className={styles.filePending} id="pit-file-note">
        <strong>工艺曲线和图纸上传</strong>
        <p>当前真实询价接口暂未接入文件传输。请先提交文字信息，工程师联系后再收取原文件。</p>
        <input type="file" multiple disabled aria-describedby="pit-file-note" />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? '提交中…' : '提交工件与工艺，先做边界判断'}
        </button>
        <p>所填信息仅用于项目工况判断与后续技术沟通。</p>
      </div>

      <p className={styles.formMessage} aria-live="polite">
        {message}
        {submissionId ? ` 提交编号：${submissionId}` : ''}
      </p>
    </form>
  );
}
