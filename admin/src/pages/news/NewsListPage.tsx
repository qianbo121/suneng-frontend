import { CalendarOutlined, CloseOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, DatePicker, Form, Image, Input, Modal, Popconfirm, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import logoImage from '@/assets/sn-logo-header-cropped.png';
import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createNews,
  deleteNews,
  getNewsDetail,
  getNewsList,
  updateNews,
  updateNewsStatus,
} from '@/services/news';
import { NewsEntity } from '@/types/news';
import { PublishStatus } from '@/types/product';

type SimpleNewsFormValues = {
  titleZh: string;
  coverImage: string;
  contentZh: string;
  publishDate: Dayjs | null;
  status: PublishStatus;
};

const PAGE_SIZE = 5;

function stripHtml(value?: string | null) {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function toHtmlContent(value: string) {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return '';

  return lines.map((line) => `<p>${line}</p>`).join('');
}

function formatPublishDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD  HH:mm') : '-';
}

function resolveInitialValues(record: NewsEntity | null): SimpleNewsFormValues {
  return {
    titleZh: record?.titleZh || '',
    coverImage: record?.coverImage || '',
    contentZh: stripHtml(record?.contentZh || record?.summaryZh),
    publishDate: record?.publishDate ? dayjs(record.publishDate) : dayjs(),
    status: record?.status || 'published',
  };
}

function buildPayload(values: SimpleNewsFormValues) {
  const contentText = values.contentZh.trim();
  const summary = contentText.slice(0, 140);

  return {
    titleZh: values.titleZh.trim(),
    titleEn: undefined,
    slug: undefined,
    coverImage: values.coverImage || undefined,
    summaryZh: summary || undefined,
    summaryEn: undefined,
    contentZh: toHtmlContent(contentText) || undefined,
    contentEn: undefined,
    publishDate: values.publishDate ? values.publishDate.toISOString() : undefined,
    isPublished: values.status === 'published',
    seoTitleZh: values.titleZh.trim() || undefined,
    seoTitleEn: undefined,
    seoDescriptionZh: summary || undefined,
    seoDescriptionEn: undefined,
    seoKeywordsZh: undefined,
    seoKeywordsEn: undefined,
    ogImage: values.coverImage || undefined,
    sortOrder: 0,
  };
}

function CoverImageField() {
  const form = Form.useFormInstance<SimpleNewsFormValues>();
  const coverImage = Form.useWatch('coverImage', form);

  return (
    <div className="simple-news-cover-field">
      {coverImage ? (
        <Image
          src={coverImage}
          alt="新闻封面图"
          preview={false}
          className="simple-news-cover-preview"
        />
      ) : (
        <div className="simple-news-cover-empty">暂无封面图</div>
      )}
      <Form.Item
        name="coverImage"
        noStyle
        rules={[{ required: true, message: '请上传新闻封面图' }]}
      >
        <ImageUploader buttonText="更换图片" />
      </Form.Item>
    </div>
  );
}

export function NewsListPage() {
  usePageTitle('新闻管理');

  const { message } = App.useApp();
  const [form] = Form.useForm<SimpleNewsFormValues>();
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NewsEntity | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(['simple-news', page, appliedKeyword], () =>
    getNewsList({
      page,
      pageSize: PAGE_SIZE,
      keyword: appliedKeyword,
      sortBy: 'publishDate',
      sortDirection: 'desc',
    }),
  );

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE)),
    [data?.total],
  );
  const items = data?.items || [];

  const openCreateModal = () => {
    setEditingRecord(null);
    form.setFieldsValue(resolveInitialValues(null));
    setModalOpen(true);
  };

  const openEditModal = async (record: NewsEntity) => {
    setLoadingDetail(true);
    try {
      const detail = await getNewsDetail(record.id);
      setEditingRecord(detail);
      form.setFieldsValue(resolveInitialValues(detail));
      setModalOpen(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSearch = () => {
    setAppliedKeyword(keyword.trim());
    setPage(1);
  };

  const handleSave = async () => {
    const values = await form.validateFields();

    setSubmitting(true);
    try {
      const payload = buildPayload(values);

      if (editingRecord) {
        const result = await updateNews(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateNewsStatus(editingRecord.id, values.status);
        }
        message.success('新闻已保存');
      } else {
        const result = await createNews(payload);
        if (values.status !== result.status) {
          await updateNewsStatus(result.id, values.status);
        }
        message.success('新闻已发布');
      }

      setModalOpen(false);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="simple-news-admin">
      <h1 className="simple-news-admin-title">新闻后台（极简版）</h1>

      <section className="simple-news-panel">
        <header className="simple-news-header">
          <div className="simple-news-brand">
            <img src={logoImage} alt="苏能工业炉" className="simple-news-brand-logo" />
            <span className="simple-news-header-divider" />
            <span className="simple-news-header-name">新闻管理</span>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="simple-news-publish-button"
            onClick={openCreateModal}
          >
            发布新闻
          </Button>
        </header>

        <div className="simple-news-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={keyword}
            placeholder="搜索新闻标题"
            className="simple-news-search"
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
          />
        </div>

        <div className="simple-news-table-wrap">
          <table className="simple-news-table">
            <thead>
              <tr>
                <th>封面图</th>
                <th>标题</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.titleZh}
                        preview={false}
                        className="simple-news-thumb"
                      />
                    ) : (
                      <div className="simple-news-thumb-empty">暂无图片</div>
                    )}
                  </td>
                  <td className="simple-news-title-cell">{item.titleZh}</td>
                  <td className="simple-news-date-cell">{formatPublishDate(item.publishDate)}</td>
                  <td>
                    <Space size={22}>
                      <button
                        type="button"
                        className="simple-news-action simple-news-action-edit"
                        disabled={loadingDetail}
                        onClick={() => void openEditModal(item)}
                      >
                        编辑
                      </button>
                      <Popconfirm
                        title="确认删除该新闻？"
                        description="删除后不可恢复。"
                        onConfirm={async () => {
                          await deleteNews(item.id);
                          message.success('删除成功');
                          await mutate();
                        }}
                      >
                        <button
                          type="button"
                          className="simple-news-action simple-news-action-delete"
                        >
                          删除
                        </button>
                      </Popconfirm>
                    </Space>
                  </td>
                </tr>
              ))}
              {!items.length && !isLoading && error ? (
                <tr>
                  <td colSpan={4} className="simple-news-empty">
                    新闻数据加载失败
                    <Button
                      size="small"
                      onClick={() => void mutate()}
                      style={{ marginInlineStart: 12 }}
                    >
                      重试
                    </Button>
                  </td>
                </tr>
              ) : null}
              {!items.length && !isLoading && !error ? (
                <tr>
                  <td colSpan={4} className="simple-news-empty">
                    暂无新闻数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="simple-news-pagination">
          <Button
            size="small"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            ‹
          </Button>
          {Array.from({ length: Math.min(pageCount, 2) }, (_, index) => index + 1).map((item) => (
            <Button
              key={item}
              size="small"
              type={page === item ? 'primary' : 'default'}
              onClick={() => setPage(item)}
            >
              {item}
            </Button>
          ))}
          <Button
            size="small"
            disabled={page >= pageCount}
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          >
            ›
          </Button>
        </div>
      </section>

      <Modal
        centered
        width={650}
        open={modalOpen}
        footer={null}
        closeIcon={null}
        destroyOnClose={false}
        className="simple-news-modal"
        onCancel={() => setModalOpen(false)}
        afterClose={() => {
          setEditingRecord(null);
          form.resetFields();
        }}
      >
        <button
          type="button"
          className="simple-news-modal-close"
          onClick={() => setModalOpen(false)}
        >
          <CloseOutlined />
        </button>
        <Form<SimpleNewsFormValues> form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="标题"
            name="titleZh"
            rules={[{ required: true, message: '请输入新闻标题' }]}
            className="simple-news-required"
          >
            <Input placeholder="请输入新闻标题" />
          </Form.Item>

          <Form.Item label="封面图" required className="simple-news-required">
            <CoverImageField />
          </Form.Item>

          <Form.Item
            label="正文"
            name="contentZh"
            rules={[{ required: true, message: '请输入新闻正文' }]}
            className="simple-news-required"
          >
            <div className="simple-news-editor-shell">
              <Input.TextArea
                autoSize={false}
                className="simple-news-editor-textarea"
                placeholder="请输入新闻正文"
              />
            </div>
          </Form.Item>

          <Form.Item
            label="发布时间"
            name="publishDate"
            rules={[{ required: true, message: '请选择发布时间' }]}
            className="simple-news-required"
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD  HH:mm"
              suffixIcon={<CalendarOutlined />}
              className="simple-news-date-picker"
            />
          </Form.Item>

          <div className="simple-news-modal-footer">
            <Button className="simple-news-cancel-button" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              type="primary"
              className="simple-news-save-button"
              loading={submitting}
              onClick={() => void handleSave()}
            >
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
