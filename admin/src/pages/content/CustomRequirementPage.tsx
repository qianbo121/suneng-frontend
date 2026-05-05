import { App, Button, Card, Form, Input, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { usePageTitle } from '@/hooks/usePageTitle';
import { getCustomRequirementList, markCustomRequirementFollowed } from '@/services/content';
import { CustomRequirementEntity, CustomRequirementStatus } from '@/types/content';

type Filters = {
  keyword: string;
  status?: CustomRequirementStatus;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  status: undefined,
};

const statusOptions = [
  { label: '未跟进', value: 'pending' },
  { label: '已跟进', value: 'followed' },
];

function RequirementStatusTag({ status }: { status: CustomRequirementStatus }) {
  return status === 'followed' ? <Tag color="green">已跟进</Tag> : <Tag color="gold">未跟进</Tag>;
}

export function CustomRequirementPage() {
  usePageTitle('客户非标需求');

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading, mutate } = useSWR(['custom-requirements', page, filters], () =>
    getCustomRequirementList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
    }),
  );

  const columns = useMemo<ColumnsType<CustomRequirementEntity>>(
    () => [
      {
        title: '提交日期',
        dataIndex: 'createdAt',
        width: 180,
        render: (value?: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
      },
      { title: '姓名', dataIndex: 'name', width: 120, render: (value?: string | null) => value || '-' },
      { title: '联系电话', dataIndex: 'phone', width: 150 },
      { title: '公司名称', dataIndex: 'company', width: 180, render: (value?: string | null) => value || '-' },
      { title: '所属行业', dataIndex: 'industry', width: 150, render: (value?: string | null) => value || '-' },
      { title: '设备工艺', dataIndex: 'process', width: 150, render: (value?: string | null) => value || '-' },
      { title: '使用温度', dataIndex: 'temperature', width: 130, render: (value?: string | null) => value || '-' },
      {
        title: '设备需求',
        dataIndex: 'requirement',
        width: 260,
        ellipsis: true,
        render: (value?: string | null) => value || '-',
      },
      {
        title: '跟进状态',
        dataIndex: 'status',
        width: 110,
        render: (value: CustomRequirementStatus) => <RequirementStatusTag status={value} />,
      },
      {
        title: '操作',
        fixed: 'right',
        width: 110,
        render: (_, record) => (
          <Button
            type="primary"
            disabled={record.status === 'followed'}
            onClick={() => {
              modal.confirm({
                title: '是否跟进？',
                content: '确认后，该需求状态将从未跟进变为已跟进。',
                okText: '是',
                cancelText: '否',
                onOk: async () => {
                  await markCustomRequirementFollowed(record.id);
                  message.success('已跟进');
                  await mutate();
                },
              });
            }}
          >
            跟进
          </Button>
        ),
      },
    ],
    [message, modal, mutate],
  );

  return (
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
              placeholder="搜索姓名 / 电话 / 公司 / 需求"
              style={{ width: 300 }}
              onSearch={() => form.submit()}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="跟进状态"
              style={{ width: 140 }}
              options={statusOptions}
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
        <Table<CustomRequirementEntity>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={data?.items || []}
          scroll={{ x: 1640 }}
          pagination={{
            current: data?.page || page,
            pageSize: data?.pageSize || 10,
            total: data?.total || 0,
            onChange: (nextPage) => setPage(nextPage),
          }}
        />
      </Card>
    </Space>
  );
}
