import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ContactMessageDetailModal } from '@/components/content/ContactMessageDetailModal';
import { ContactStatusTag, contactStatusOptions } from '@/components/content/ContentStatusTag';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  deleteContactMessage,
  getContactMessageDetail,
  getContactMessageList,
  markContactMessageRead,
  updateContactMessageStatus,
} from '@/services/content';
import { ContactMessageEntity, ContactMessageStatus } from '@/types/content';

type Filters = {
  keyword: string;
  status?: ContactMessageStatus;
  isRead?: boolean;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  status: undefined,
  isRead: undefined,
};

export function ContactMessagePage() {
  usePageTitle('留言管理');

  const { message } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useSWR(['contact-messages', page, filters], () =>
    getContactMessageList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      isRead: filters.isRead,
    }),
  );

  const { data: detail, mutate: mutateDetail } = useSWR(
    currentId && detailOpen ? ['contact-message-detail', currentId] : null,
    () => getContactMessageDetail(currentId as number),
  );

  const columns = useMemo<ColumnsType<ContactMessageEntity>>(
    () => [
      { title: '姓名', dataIndex: 'name', width: 120 },
      { title: '电话', dataIndex: 'phone', width: 140 },
      { title: '邮箱', dataIndex: 'email', width: 200 },
      { title: '公司', dataIndex: 'company', render: (value?: string | null) => value || '-' },
      {
        title: '已读',
        dataIndex: 'isRead',
        width: 90,
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'gold'}>{value ? '已读' : '未读'}</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 110,
        render: (value: ContactMessageStatus) => <ContactStatusTag status={value} />,
      },
      {
        title: '提交时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (value?: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
      },
      {
        title: '操作',
        width: 320,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentId(record.id);
                setDetailOpen(true);
              }}
            >
              查看
            </Button>
            <Button
              disabled={record.isRead}
              onClick={async () => {
                await markContactMessageRead(record.id);
                message.success('已标记为已读');
                await Promise.all([mutate(), mutateDetail()]);
              }}
            >
              标记已读
            </Button>
            <Select
              size="small"
              value={record.status}
              style={{ width: 120 }}
              options={contactStatusOptions as { label: string; value: string }[]}
              onChange={async (status: ContactMessageStatus) => {
                await updateContactMessageStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该留言？"
              onConfirm={async () => {
                await deleteContactMessage(record.id);
                message.success('删除成功');
                await mutate();
              }}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [message, mutate, mutateDetail],
  );

  return (
    <>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Form
            form={form}
            layout="inline"
            initialValues={DEFAULT_FILTERS}
            onFinish={(values) => {
              setFilters(values);
              setPage(1);
            }}
          >
            <Form.Item name="keyword">
              <Input.Search
                allowClear
                placeholder="搜索姓名 / 电话 / 邮箱"
                style={{ width: 280 }}
                onSearch={() => form.submit()}
              />
            </Form.Item>
            <Form.Item name="status">
              <Select
                allowClear
                placeholder="全部状态"
                style={{ width: 140 }}
                options={contactStatusOptions as { label: string; value: string }[]}
              />
            </Form.Item>
            <Form.Item name="isRead">
              <Select
                allowClear
                placeholder="阅读状态"
                style={{ width: 140 }}
                options={[
                  { label: '未读', value: false },
                  { label: '已读', value: true },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<ContactMessageEntity>
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

      <ContactMessageDetailModal
        open={detailOpen}
        record={detail || null}
        onCancel={() => {
          setDetailOpen(false);
          setCurrentId(null);
        }}
      />
    </>
  );
}
