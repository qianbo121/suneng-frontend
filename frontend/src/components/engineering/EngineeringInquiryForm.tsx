'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { HiOutlinePaperClip, HiXMark } from 'react-icons/hi2';
import {
  buildHomepageRequirementPayload,
  validateHomepageRequirement,
  type HomepageRequirementValues,
} from '@/lib/api/homepage-requirements';
import {
  getFormIdempotencyKey,
  renewIdempotencyKeyAfterConflict,
} from '@/lib/api/custom-requirements';
import { buildLeadSourceSnapshot } from '@/lib/api/lead-events';
import {
  INQUIRY_FILE_ACCEPT,
  INQUIRY_FILE_COUNT,
  submitEngineeringRequirement,
  uploadInquiryFile,
  validateInquiryFile,
} from '@/lib/api/engineering-requirements';
import { isApiRequestErrorStatus } from '@/lib/api/client';
import { inquiryCopy } from './engineering-content';
import styles from './EngineeringPage.module.css';

type Attachment = { file: File; receipt?: string };
export function EngineeringInquiryForm({ kind }: { kind: 'line' | 'renovation' }) {
  const copy = inquiryCopy[kind];
  const [values, setValues] = useState<HomepageRequirementValues>({
    direction: copy.direction,
    problem: '',
    identity: '',
    contact: '',
  });
  const [files, setFiles] = useState<Attachment[]>([]);
  const [message, setMessage] = useState('');
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const busy = useRef(false);
  const key = useRef<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!submissionId) return;
    confirmation.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    confirmation.current?.focus({ preventScroll: true });
  }, [submissionId]);
  const update = (field: keyof HomepageRequirementValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setInvalidField(null);
    setMessage('');
  };
  const addFiles = (selected: FileList | null) => {
    if (!selected) return;
    const incoming = Array.from(selected);
    const issue = incoming.map(validateInquiryFile).find(Boolean);
    if (issue || files.length + incoming.length > INQUIRY_FILE_COUNT) {
      setMessage(issue || '每次最多添加3个附件。');
      return;
    }
    setFiles((current) => [...current, ...incoming.map((file) => ({ file }))]);
    setMessage('');
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const issue = validateHomepageRequirement(values);
    if (issue) {
      const labels = {
        direction: '需求类型',
        problem: copy.content,
        identity: '联系人',
        contact: '可回复的手机号码或微信号',
      };
      setInvalidField(issue);
      setMessage(`请填写${labels[issue]}。`);
      (form.current?.elements.namedItem(issue) as HTMLElement | null)?.focus();
      return;
    }
    busy.current = true;
    setMessage('');
    const pending = files.map((item) => ({ ...item }));
    try {
      const inquiryKey = getFormIdempotencyKey(key);
      for (const [index, item] of pending.entries()) {
        if (!item.receipt) {
          setProgress(`正在上传附件 ${index + 1}/${pending.length}…`);
          item.receipt = await uploadInquiryFile(item.file, inquiryKey);
          setFiles(pending.map((file) => ({ ...file })));
        }
      }
      setProgress('正在提交…');
      const result = await submitEngineeringRequirement(
        buildHomepageRequirementPayload(
          values,
          buildLeadSourceSnapshot({
            pageType: kind === 'line' ? '连续热处理生产线解决方案页' : '工业炉维修改造服务页',
            productTag: copy.direction,
          }),
          inquiryKey,
        ),
        pending.map((item) => item.receipt!),
      );
      setSubmissionId(String(result.submissionId));
    } catch (error) {
      if (renewIdempotencyKeyAfterConflict(error, key))
        setFiles((current) => current.map(({ file }) => ({ file })));
      if (
        isApiRequestErrorStatus(error, 400) &&
        error instanceof Error &&
        error.message.includes('Attachment confirmation')
      ) {
        setFiles((current) => current.map(({ file }) => ({ file })));
      }
      const tooLong =
        isApiRequestErrorStatus(error, 400) &&
        error instanceof Error &&
        error.message.startsWith('需求正文过长');
      if (tooLong) setInvalidField('problem');
      setMessage(
        error instanceof Error && (error.message.startsWith('附件') || tooLong)
          ? error.message
          : '需求暂未确认提交成功，已保留您填写的内容和附件，请稍后重试或通过微信联系。',
      );
    } finally {
      busy.current = false;
      setProgress('');
    }
  };
  return (
    <div className={styles.form}>
      <h3>{copy.formTitle}</h3>
      {submissionId ? (
        <div ref={confirmation} className={styles.success} role="status" tabIndex={-1}>
          <h3>需求已提交</h3>
          <p>服务端已接收，编号：{submissionId}</p>
          <p>{copy.note}</p>
        </div>
      ) : (
        <form
          ref={form}
          onSubmit={submit}
          noValidate
          aria-label={copy.formTitle}
          aria-busy={Boolean(progress)}
        >
          <fieldset disabled={Boolean(progress)}>
            <div className={styles.fields}>
              <label>
                需求类型
                <select
                  name="direction"
                  value={values.direction}
                  onChange={(e) => update('direction', e.target.value)}
                >
                  <option>热处理生产线</option>
                  <option>旧炉维修／改造</option>
                </select>
              </label>
              <label>
                {copy.content}
                <textarea
                  name="problem"
                  maxLength={8000}
                  value={values.problem}
                  onChange={(e) => update('problem', e.target.value)}
                  placeholder={
                    kind === 'line'
                      ? '例如：工件照片、已知材质与目标产量；不清楚的可注明未知…'
                      : '例如：台车炉、温度不均、计划下月停产检查…'
                  }
                  required
                  aria-invalid={invalidField === 'problem'}
                  aria-describedby={invalidField === 'problem' ? `${kind}-form-error` : undefined}
                />
              </label>
              <div className={styles.upload}>
                <label htmlFor={`${kind}-attachments`}>
                  <HiOutlinePaperClip aria-hidden="true" />
                  {copy.attachment}
                </label>
                <input
                  id={`${kind}-attachments`}
                  type="file"
                  multiple
                  accept={INQUIRY_FILE_ACCEPT}
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                  }}
                  aria-describedby={`${kind}-file-note`}
                />
                <p id={`${kind}-file-note`} className={styles.note}>
                  最多3个，每个不超过5MB；支持JPG、PNG、WebP、PDF。
                </p>
                {files.length > 0 && (
                  <ul className={styles.fileList}>
                    {files.map((item, index) => (
                      <li key={`${index}-${item.file.name}`}>
                        <span>
                          {item.file.name}
                          {item.receipt ? '（已上传）' : ''}
                        </span>
                        <button
                          type="button"
                          aria-label={`移除附件 ${item.file.name}`}
                          onClick={() =>
                            setFiles((current) => current.filter((_, i) => i !== index))
                          }
                        >
                          <HiXMark aria-hidden="true" width={20} height={20} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.contacts}>
                <label>
                  联系人
                  <input
                    name="identity"
                    autoComplete="name"
                    maxLength={180}
                    value={values.identity}
                    onChange={(e) => update('identity', e.target.value)}
                    required
                    aria-invalid={invalidField === 'identity'}
                    aria-describedby={
                      invalidField === 'identity' ? `${kind}-form-error` : undefined
                    }
                  />
                </label>
                <label>
                  手机／微信
                  <input
                    name="contact"
                    autoComplete="tel"
                    maxLength={254}
                    spellCheck={false}
                    value={values.contact}
                    onChange={(e) => update('contact', e.target.value)}
                    required
                    aria-invalid={invalidField === 'contact'}
                    aria-describedby={invalidField === 'contact' ? `${kind}-form-error` : undefined}
                  />
                </label>
              </div>
            </div>
          </fieldset>
          {message && (
            <p id={`${kind}-form-error`} className={styles.error} role="alert">
              {message}
            </p>
          )}
          <button
            type="submit"
            className={`${styles.button} ${styles.submit}`}
            style={{ marginTop: 12 }}
            disabled={Boolean(progress)}
          >
            {progress || '提交需求，沟通方案'}
          </button>
          <p className={styles.note} aria-live="polite">
            {copy.note}
          </p>
        </form>
      )}
    </div>
  );
}
