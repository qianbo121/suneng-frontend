import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Skeleton, Space } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import { NewsEditorForm } from '@/components/news/NewsEditorForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getAllNewsCategories } from '@/services/news-categories';
import { createNews, getNewsDetail, updateNews, updateNewsStatus } from '@/services/news';
import { NewsEntity, NewsFormValues } from '@/types/news';

const INITIAL_VALUES: NewsFormValues = {
  titleZh: '',
  titleEn: '',
  slug: '',
  categoryId: null,
  coverImage: '',
  summaryZh: '',
  summaryEn: '',
  contentZh: '',
  contentEn: '',
  publishDate: dayjs(),
  seoTitleZh: '',
  seoTitleEn: '',
  seoDescriptionZh: '',
  seoDescriptionEn: '',
  seoKeywordsZh: '',
  seoKeywordsEn: '',
  ogImage: '',
  sortOrder: 0,
  status: 'draft',
};

function mapNewsToFormValues(record?: NewsEntity): NewsFormValues {
  if (!record) return INITIAL_VALUES;

  return {
    titleZh: record.titleZh,
    titleEn: record.titleEn || '',
    slug: record.slug || '',
    categoryId: record.categoryId,
    coverImage: record.coverImage || '',
    summaryZh: record.summaryZh || '',
    summaryEn: record.summaryEn || '',
    contentZh: record.contentZh || '',
    contentEn: record.contentEn || '',
    publishDate: record.publishDate ? dayjs(record.publishDate) : dayjs(),
    seoTitleZh: record.seoTitleZh || '',
    seoTitleEn: record.seoTitleEn || '',
    seoDescriptionZh: record.seoDescriptionZh || '',
    seoDescriptionEn: record.seoDescriptionEn || '',
    seoKeywordsZh: record.seoKeywordsZh || '',
    seoKeywordsEn: record.seoKeywordsEn || '',
    ogImage: record.ogImage || '',
    sortOrder: record.sortOrder || 0,
    status: record.status || 'draft',
  };
}

function mapFormToPayload(values: NewsFormValues) {
  return {
    titleZh: values.titleZh.trim(),
    titleEn: values.titleEn.trim() || undefined,
    slug: values.slug.trim() || undefined,
    categoryId: Number(values.categoryId),
    coverImage: values.coverImage || undefined,
    summaryZh: values.summaryZh.trim() || undefined,
    summaryEn: values.summaryEn.trim() || undefined,
    contentZh: values.contentZh || undefined,
    contentEn: values.contentEn || undefined,
    publishDate: values.publishDate ? values.publishDate.toISOString() : undefined,
    isPublished: values.status === 'published',
    seoTitleZh: values.seoTitleZh.trim() || undefined,
    seoTitleEn: values.seoTitleEn.trim() || undefined,
    seoDescriptionZh: values.seoDescriptionZh.trim() || undefined,
    seoDescriptionEn: values.seoDescriptionEn.trim() || undefined,
    seoKeywordsZh: values.seoKeywordsZh.trim() || undefined,
    seoKeywordsEn: values.seoKeywordsEn.trim() || undefined,
    ogImage: values.ogImage || undefined,
    sortOrder: Number(values.sortOrder) || 0,
  };
}

export function NewsEditorPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const newsId = params.id ? Number(params.id) : null;
  const isEdit = Boolean(newsId);
  usePageTitle(isEdit ? '编辑新闻' : '新增新闻');

  const { message } = App.useApp();
  const [form] = Form.useForm<NewsFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const { data: categories = [] } = useSWR('news-categories-all', getAllNewsCategories);
  const { data: detail, isLoading } = useSWR(
    isEdit && newsId ? ['news-detail', newsId] : null,
    () => getNewsDetail(newsId as number),
  );

  useEffect(() => {
    form.setFieldsValue(mapNewsToFormValues(detail));
  }, [detail, form]);

  const pageTitle = useMemo(() => (isEdit ? '编辑新闻' : '新增新闻'), [isEdit]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(values);

      if (isEdit && newsId) {
        const result = await updateNews(newsId, payload);
        if (values.status && values.status !== result.status) {
          await updateNewsStatus(newsId, values.status);
        }
        message.success('新闻更新成功');
      } else {
        const result = await createNews(payload);
        if (values.status && values.status !== result.status) {
          await updateNewsStatus(result.id, values.status);
        }
        message.success('新闻创建成功');
      }

      navigate('/news');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="admin-page-header">
          <div>
            <h2 className="admin-page-title">{pageTitle}</h2>
            <p className="admin-page-description">
              维护新闻标题、分类、富文本正文、发布日期与 SEO 配置。
            </p>
          </div>
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/news')}>
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              保存新闻
            </Button>
          </Space>
        </div>
      </Card>

      {isLoading && isEdit ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <NewsEditorForm form={form} categories={categories} />
      )}
    </Space>
  );
}
