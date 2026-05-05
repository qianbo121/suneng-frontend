import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Image, Input, Modal, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ContentStatusTag, publishStatusOptions } from '@/components/content/ContentStatusTag';
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import {
  createChairman,
  deleteChairman,
  getChairmanList,
  updateChairman,
  updateChairmanStatus,
} from '@/services/content';
import { ChairmanMessageEntity, ChairmanMessageFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: ChairmanMessageFormValues = {
  titleZh: '',
  titleEn: '',
  contentZh: '',
  contentEn: '',
  imageUrl: '',
  status: 'draft',
};

export function AboutChairmanManager() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ChairmanMessageFormValues>();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChairmanMessageEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data, isLoading, mutate } = useSWR('about-chairman', () =>
    getChairmanList({ page: 1, pageSize: 50, sortBy: 'updatedAt', sortDirection: 'desc' }),
  );

  const columns = useMemo<ColumnsType<ChairmanMessageEntity>>(
    () => [
      {
        title: '照片',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value?: string | null) =>
          value ? <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} /> : '-',
      },
      { title: '中文标题', dataIndex: 'titleZh' },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: PublishStatus) => <ContentStatusTag status={value} />,
      },
      {
        title: '操作',
        width: 280,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                form.setFieldsValue({
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  contentZh: record.contentZh || '',
                  contentEn: record.contentEn || '',
                  imageUrl: record.imageUrl || '',
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
                await updateChairmanStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该致辞？"
              onConfirm={async () => {
                await deleteChairman(record.id);
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
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        contentZh: values.contentZh || undefined,
        contentEn: values.contentEn || undefined,
        imageUrl: values.imageUrl || undefined,
      };

      if (editingRecord) {
        const result = await updateChairman(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateChairmanStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createChairman(payload);
        if (values.status !== result.status) {
          await updateChairmanStatus(result.id, values.status);
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecord(null);
            form.setFieldsValue(INITIAL_VALUES);
            setOpen(true);
          }}
        >
          新增致辞
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.items || []}
        pagination={false}
      />

      <Modal
        open={open}
        title={editingRecord ? '编辑董事长致辞' : '新增董事长致辞'}
        width={920}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
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
          <Form.Item label="照片" name="imageUrl">
            <ImageUploader buttonText="上传照片" />
          </Form.Item>
          <Form.Item label="中文内容" name="contentZh">
            <RichTextEditor minHeight={220} />
          </Form.Item>
          <Form.Item label="英文内容" name="contentEn">
            <RichTextEditor minHeight={220} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={publishStatusOptions as { label: string; value: string }[]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
