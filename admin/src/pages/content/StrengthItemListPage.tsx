import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Image, Input, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { ContentStatusTag, publishStatusOptions } from '@/components/content/ContentStatusTag';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  deleteStrengthItem,
  getAllStrengthCategories,
  getStrengthItemList,
  updateStrengthItemStatus,
} from '@/services/content';
import { StrengthCategoryEntity, StrengthItemEntity } from '@/types/content';
import { PublishStatus } from '@/types/product';

type Filters = {
  keyword: string;
  categoryId?: number;
  status?: PublishStatus;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  categoryId: undefined,
  status: undefined,
};

export function StrengthItemListPage() {
  usePageTitle('实力展示内容');

  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useSWR('strength-categories-all', getAllStrengthCategories);
  const { data, isLoading, mutate } = useSWR(['strength-items', page, filters], () =>
    getStrengthItemList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      categoryId: filters.categoryId,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((item: StrengthCategoryEntity) => ({
        label: item.nameZh,
        value: item.id,
      })),
    [categories],
  );

  const columns = useMemo<ColumnsType<StrengthItemEntity>>(
    () => [
      {
        title: '主图',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value?: string | null) =>
          value ? <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} /> : '-',
      },
      { title: '中文标题', dataIndex: 'titleZh' },
      {
        title: '分类',
        dataIndex: ['category', 'nameZh'],
        render: (value?: string) => value || '-',
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
        width: 280,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/strength-items/${record.id}/edit`)}
            >
              编辑
            </Button>
            <Select
              size="small"
              value={record.status}
              style={{ width: 110 }}
              options={publishStatusOptions as { label: string; value: string }[]}
              onChange={async (status: PublishStatus) => {
                await updateStrengthItemStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该内容？"
              onConfirm={async () => {
                await deleteStrengthItem(record.id);
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
    [message, mutate, navigate],
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
              placeholder="搜索标题"
              style={{ width: 260 }}
              onSearch={() => form.submit()}
            />
          </Form.Item>
          <Form.Item name="categoryId">
            <Select
              allowClear
              placeholder="全部分类"
              style={{ width: 180 }}
              options={categoryOptions}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 140 }}
              options={publishStatusOptions as { label: string; value: string }[]}
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
              onClick={() => navigate('/strength-items/new')}
            >
              新增内容
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<StrengthItemEntity>
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
  );
}
