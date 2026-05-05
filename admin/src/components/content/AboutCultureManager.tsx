import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Form,
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
import {
  createCulture,
  deleteCulture,
  getCultureList,
  updateCulture,
  updateCultureStatus,
} from '@/services/content';
import { CultureValueEntity, CultureValueFormValues, CultureValueType } from '@/types/content';
import { PublishStatus } from '@/types/product';

const cultureTypeOptions: { label: string; value: CultureValueType }[] = [
  { label: '使命', value: 'mission' },
  { label: '愿景', value: 'vision' },
  { label: '价值观', value: 'value' },
];

const INITIAL_VALUES: CultureValueFormValues = {
  type: 'mission',
  titleZh: '',
  titleEn: '',
  contentZh: '',
  contentEn: '',
  icon: '',
  sortOrder: 0,
  status: 'draft',
};

export function AboutCultureManager() {
  const { message } = App.useApp();
  const [form] = Form.useForm<CultureValueFormValues>();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CultureValueEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data, isLoading, mutate } = useSWR('about-culture', () =>
    getCultureList({ page: 1, pageSize: 100, sortBy: 'sortOrder', sortDirection: 'asc' }),
  );

  const columns = useMemo<ColumnsType<CultureValueEntity>>(
    () => [
      {
        title: '类型',
        dataIndex: 'type',
        width: 100,
        render: (value: CultureValueType) =>
          cultureTypeOptions.find((item) => item.value === value)?.label || value,
      },
      { title: '中文标题', dataIndex: 'titleZh' },
      { title: '图标', dataIndex: 'icon', render: (value?: string | null) => value || '-' },
      { title: '排序', dataIndex: 'sortOrder', width: 80 },
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
                  type: record.type,
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  contentZh: record.contentZh || '',
                  contentEn: record.contentEn || '',
                  icon: record.icon || '',
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
                await updateCultureStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该文化项？"
              onConfirm={async () => {
                await deleteCulture(record.id);
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
        type: values.type,
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        contentZh: values.contentZh.trim() || undefined,
        contentEn: values.contentEn.trim() || undefined,
        icon: values.icon.trim() || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateCulture(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateCultureStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createCulture(payload);
        if (values.status !== result.status) {
          await updateCultureStatus(result.id, values.status);
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
          新增文化项
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
        title={editingRecord ? '编辑文化项' : '新增文化项'}
        width={720}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
            <Select options={cultureTypeOptions} />
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
          <Form.Item label="图标（图标名或 URL）" name="icon">
            <Input />
          </Form.Item>
          <Form.Item label="中文描述" name="contentZh">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="英文描述" name="contentEn">
            <Input.TextArea rows={4} />
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
