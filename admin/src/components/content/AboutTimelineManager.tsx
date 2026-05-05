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
  createTimeline,
  deleteTimeline,
  getTimelineList,
  updateTimeline,
  updateTimelineStatus,
} from '@/services/content';
import { TimelineEventEntity, TimelineEventFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: TimelineEventFormValues = {
  year: new Date().getFullYear(),
  titleZh: '',
  titleEn: '',
  contentZh: '',
  contentEn: '',
  sortOrder: 0,
  status: 'draft',
};

export function AboutTimelineManager() {
  const { message } = App.useApp();
  const [form] = Form.useForm<TimelineEventFormValues>();
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TimelineEventEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data, isLoading, mutate } = useSWR('about-timeline', () =>
    getTimelineList({ page: 1, pageSize: 100, sortBy: 'year', sortDirection: 'desc' }),
  );

  const columns = useMemo<ColumnsType<TimelineEventEntity>>(
    () => [
      { title: '年份', dataIndex: 'year', width: 100 },
      { title: '中文标题', dataIndex: 'titleZh' },
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
                  year: record.year,
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  contentZh: record.contentZh || '',
                  contentEn: record.contentEn || '',
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
                await updateTimelineStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该时间轴事件？"
              onConfirm={async () => {
                await deleteTimeline(record.id);
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
        year: Number(values.year),
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        contentZh: values.contentZh.trim() || undefined,
        contentEn: values.contentEn.trim() || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateTimeline(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateTimelineStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createTimeline(payload);
        if (values.status !== result.status) {
          await updateTimelineStatus(result.id, values.status);
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
          新增时间轴事件
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
        title={editingRecord ? '编辑时间轴事件' : '新增时间轴事件'}
        width={720}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item label="年份" name="year" rules={[{ required: true, message: '请输入年份' }]}>
            <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
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
