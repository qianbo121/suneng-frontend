import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ContentStatusTag, publishStatusOptions } from '@/components/content/ContentStatusTag';
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import {
  createAboutSection,
  deleteAboutSection,
  getAboutSectionList,
  updateAboutSection,
  updateAboutSectionStatus,
} from '@/services/content';
import { AboutSectionEntity, AboutSectionFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: AboutSectionFormValues = {
  sectionKey: '',
  titleZh: '',
  titleEn: '',
  contentZh: '',
  contentEn: '',
  imageUrl: '',
  sortOrder: 0,
  status: 'draft',
};

export function AboutSectionManager() {
  const { message } = App.useApp();
  const [form] = Form.useForm<AboutSectionFormValues>();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AboutSectionEntity | null>(null);
  const { data, isLoading, mutate } = useSWR('about-sections', () =>
    getAboutSectionList({ page: 1, pageSize: 100, sortBy: 'sortOrder', sortDirection: 'asc' }),
  );

  const columns = useMemo<ColumnsType<AboutSectionEntity>>(
    () => [
      { title: '段落标识', dataIndex: 'sectionKey', width: 160 },
      { title: '中文标题', dataIndex: 'titleZh' },
      {
        title: '配图',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value?: string | null) =>
          value ? <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} /> : '-',
      },
      { title: '排序', dataIndex: 'sortOrder', width: 80 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: PublishStatus) => <ContentStatusTag status={value} />,
      },
      {
        title: '操作',
        key: 'actions',
        width: 280,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                form.setFieldsValue({
                  sectionKey: record.sectionKey,
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  contentZh: record.contentZh || '',
                  contentEn: record.contentEn || '',
                  imageUrl: record.imageUrl || '',
                  sortOrder: record.sortOrder || 0,
                  status: record.status || 'draft',
                });
                setOpen(true);
              }}
            >
              编辑
            </Button>
            <Select
              size="small"
              value={record.status}
              style={{ width: 110 }}
              options={publishStatusOptions as { label: string; value: string }[]}
              onChange={async (status: PublishStatus) => {
                await updateAboutSectionStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该段落？"
              onConfirm={async () => {
                await deleteAboutSection(record.id);
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
    [form, message, mutate],
  );

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const payload = {
        sectionKey: values.sectionKey.trim(),
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        contentZh: values.contentZh || undefined,
        contentEn: values.contentEn || undefined,
        imageUrl: values.imageUrl || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateAboutSection(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateAboutSectionStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createAboutSection(payload);
        if (values.status !== result.status) {
          await updateAboutSectionStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '更新成功' : '创建成功');
      setOpen(false);
      setEditingRecord(null);
      form.setFieldsValue(INITIAL_VALUES);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.setFieldsValue(INITIAL_VALUES);
              setOpen(true);
            }}
          >
            新增简介段落
          </Button>
        </div>
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={data?.items || []}
          pagination={false}
        />
      </Space>

      <Modal
        open={open}
        title={editingRecord ? '编辑公司简介段落' : '新增公司简介段落'}
        width={960}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="段落标识"
            name="sectionKey"
            rules={[{ required: true, message: '请输入段落标识' }]}
          >
            <Input placeholder="如 company-profile / factory-overview" />
          </Form.Item>
          <Form.Item
            label="中文标题"
            name="titleZh"
            rules={[{ required: true, message: '请输入中文标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="英文标题" name="titleEn">
            <Input />
          </Form.Item>
          <Form.Item label="配图" name="imageUrl">
            <ImageUploader buttonText="上传配图" />
          </Form.Item>
          <Form.Item label="中文内容" name="contentZh">
            <RichTextEditor minHeight={220} />
          </Form.Item>
          <Form.Item label="英文内容" name="contentEn">
            <RichTextEditor minHeight={220} />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={publishStatusOptions as { label: string; value: string }[]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
