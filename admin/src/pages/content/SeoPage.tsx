import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { createSeoMeta, deleteSeoMeta, getSeoList, updateSeoMeta } from '@/services/content';
import { SeoMetaEntity, SeoMetaFormValues } from '@/types/content';

const INITIAL_VALUES: SeoMetaFormValues = {
  pageKey: '',
  titleZh: '',
  titleEn: '',
  descriptionZh: '',
  descriptionEn: '',
  keywordsZh: '',
  keywordsEn: '',
  ogImage: '',
};

export function SeoPage() {
  usePageTitle('SEO 配置');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string }>();
  const [editForm] = Form.useForm<SeoMetaFormValues>();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SeoMetaEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(['seo', page, keyword], () =>
    getSeoList({
      page,
      pageSize: 10,
      keyword,
    }),
  );

  const columns = useMemo<ColumnsType<SeoMetaEntity>>(
    () => [
      { title: '页面路径标识', dataIndex: 'pageKey', width: 180 },
      { title: '中文标题', dataIndex: 'titleZh', render: (value?: string | null) => value || '-' },
      { title: '英文标题', dataIndex: 'titleEn', render: (value?: string | null) => value || '-' },
      {
        title: '操作',
        width: 180,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                editForm.setFieldsValue({
                  pageKey: record.pageKey,
                  titleZh: record.titleZh || '',
                  titleEn: record.titleEn || '',
                  descriptionZh: record.descriptionZh || '',
                  descriptionEn: record.descriptionEn || '',
                  keywordsZh: record.keywordsZh || '',
                  keywordsEn: record.keywordsEn || '',
                  ogImage: record.ogImage || '',
                });
                setOpen(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该 SEO 配置？"
              onConfirm={async () => {
                await deleteSeoMeta(record.id);
                message.success('删除成功');
                await mutate();
              }}
            >
              <Button danger>删除</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [editForm, message, mutate],
  );

  const handleSubmit = async () => {
    const values = await editForm.validateFields();
    setSubmitting(true);
    try {
      const payload = {
        pageKey: values.pageKey.trim(),
        titleZh: values.titleZh.trim() || undefined,
        titleEn: values.titleEn.trim() || undefined,
        descriptionZh: values.descriptionZh.trim() || undefined,
        descriptionEn: values.descriptionEn.trim() || undefined,
        keywordsZh: values.keywordsZh.trim() || undefined,
        keywordsEn: values.keywordsEn.trim() || undefined,
        ogImage: values.ogImage || undefined,
      };

      if (editingRecord) {
        await updateSeoMeta(editingRecord.id, payload);
      } else {
        await createSeoMeta(payload);
      }

      message.success(editingRecord ? 'SEO 配置更新成功' : 'SEO 配置创建成功');
      setOpen(false);
      setEditingRecord(null);
      editForm.setFieldsValue(INITIAL_VALUES);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Form
            form={listForm}
            layout="inline"
            initialValues={{ keyword: '' }}
            onFinish={(values) => {
              setKeyword(values.keyword || '');
              setPage(1);
            }}
          >
            <Form.Item name="keyword">
              <Input.Search
                allowClear
                placeholder="搜索 pageKey / 标题"
                style={{ width: 260 }}
                onSearch={() => listForm.submit()}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRecord(null);
                  editForm.setFieldsValue(INITIAL_VALUES);
                  setOpen(true);
                }}
              >
                新增配置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<SeoMetaEntity>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={data?.items || []}
            pagination={{
              current: data?.page || page,
              pageSize: data?.pageSize || 10,
              total: data?.total || 0,
              onChange: (nextPage) => setPage(nextPage),
            }}
          />
        </Card>
      </Space>

      <Modal
        open={open}
        title={editingRecord ? '编辑 SEO 配置' : '新增 SEO 配置'}
        width={760}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="页面路径标识"
            name="pageKey"
            rules={[{ required: true, message: '请输入页面路径标识' }]}
          >
            <Input placeholder="如 home / about / products/detail" />
          </Form.Item>
          <Form.Item label="中文标题" name="titleZh">
            <Input />
          </Form.Item>
          <Form.Item label="英文标题" name="titleEn">
            <Input />
          </Form.Item>
          <Form.Item label="中文描述" name="descriptionZh">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="英文描述" name="descriptionEn">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="中文关键词" name="keywordsZh">
            <Input />
          </Form.Item>
          <Form.Item label="英文关键词" name="keywordsEn">
            <Input />
          </Form.Item>
          <Form.Item label="OG 图片" name="ogImage">
            <ImageUploader buttonText="上传 OG 图片" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
