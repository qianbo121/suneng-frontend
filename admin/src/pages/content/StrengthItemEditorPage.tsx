import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Skeleton, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import { StrengthItemEditorForm } from '@/components/content/StrengthItemEditorForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createStrengthItem,
  getAllStrengthCategories,
  getStrengthItemDetail,
  updateStrengthItem,
  updateStrengthItemStatus,
} from '@/services/content';
import { StrengthItemEntity, StrengthItemFormValues } from '@/types/content';

const INITIAL_VALUES: StrengthItemFormValues = {
  categoryId: null,
  titleZh: '',
  titleEn: '',
  summaryZh: '',
  summaryEn: '',
  contentZh: '',
  contentEn: '',
  imageUrl: '',
  imagesJson: [],
  sortOrder: 0,
  status: 'draft',
};

function mapToFormValues(record?: StrengthItemEntity): StrengthItemFormValues {
  if (!record) return INITIAL_VALUES;

  return {
    categoryId: record.categoryId,
    titleZh: record.titleZh,
    titleEn: record.titleEn || '',
    summaryZh: record.summaryZh || '',
    summaryEn: record.summaryEn || '',
    contentZh: record.contentZh || '',
    contentEn: record.contentEn || '',
    imageUrl: record.imageUrl || '',
    imagesJson: Array.isArray(record.imagesJson)
      ? record.imagesJson.filter((item): item is string => typeof item === 'string')
      : [],
    sortOrder: record.sortOrder || 0,
    status: record.status || 'draft',
  };
}

export function StrengthItemEditorPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const itemId = params.id ? Number(params.id) : null;
  const isEdit = Boolean(itemId);
  usePageTitle(isEdit ? '编辑实力内容' : '新增实力内容');

  const { message } = App.useApp();
  const [form] = Form.useForm<StrengthItemFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { data: categories = [] } = useSWR('strength-categories-all', getAllStrengthCategories);
  const { data: detail, isLoading } = useSWR(
    isEdit && itemId ? ['strength-item-detail', itemId] : null,
    () => getStrengthItemDetail(itemId as number),
  );

  useEffect(() => {
    form.setFieldsValue(mapToFormValues(detail));
  }, [detail, form]);

  const pageTitle = useMemo(() => (isEdit ? '编辑实力内容' : '新增实力内容'), [isEdit]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(values.categoryId),
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        summaryZh: values.summaryZh.trim() || undefined,
        summaryEn: values.summaryEn.trim() || undefined,
        contentZh: values.contentZh || undefined,
        contentEn: values.contentEn || undefined,
        imageUrl: values.imageUrl || undefined,
        imagesJson: values.imagesJson.filter(Boolean),
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (isEdit && itemId) {
        const result = await updateStrengthItem(itemId, payload);
        if (values.status !== result.status) {
          await updateStrengthItemStatus(itemId, values.status);
        }
      } else {
        const result = await createStrengthItem(payload);
        if (values.status !== result.status) {
          await updateStrengthItemStatus(result.id, values.status);
        }
      }

      message.success(isEdit ? '内容更新成功' : '内容创建成功');
      navigate('/strength-items');
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
            <p className="admin-page-description">维护实力展示图文内容、图集、双语摘要和正文。</p>
          </div>
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/strength-items')}>
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              保存内容
            </Button>
          </Space>
        </div>
      </Card>

      {isLoading && isEdit ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <StrengthItemEditorForm form={form} categories={categories} />
      )}
    </Space>
  );
}
