import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Image, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ProductCategoryModal } from '@/components/products/ProductCategoryModal';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryList,
  updateProductCategory,
  updateProductCategoryStatus,
} from '@/services/product-categories';
import { ProductCategoryEntity, ProductCategoryFormValues, PublishStatus } from '@/types/product';

type Filters = {
  keyword: string;
  status?: PublishStatus;
  sortDirection?: 'asc' | 'desc';
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  status: undefined,
  sortDirection: 'asc',
};

export function ProductCategoryPage() {
  usePageTitle('产品分类');

  const { message } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductCategoryEntity | null>(null);

  const { data, isLoading, mutate } = useSWR(['product-categories', page, filters], () =>
    getProductCategoryList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: filters.sortDirection,
    }),
  );

  const columns = useMemo<ColumnsType<ProductCategoryEntity>>(
    () => [
      {
        title: '封面图',
        dataIndex: 'coverImage',
        width: 100,
        render: (value?: string) =>
          value ? <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} /> : '-',
      },
      {
        title: '中文名称',
        dataIndex: 'nameZh',
      },
      {
        title: '英文名称',
        dataIndex: 'nameEn',
        render: (value?: string | null) => value || '-',
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
      },
      {
        title: '排序',
        dataIndex: 'sortOrder',
        width: 90,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 110,
        render: (status: PublishStatus | undefined) => {
          if (status === 'published') return <Tag color="green">已发布</Tag>;
          if (status === 'offline') return <Tag color="orange">已下线</Tag>;
          return <Tag>草稿</Tag>;
        },
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
                setModalOpen(true);
              }}
            >
              编辑
            </Button>
            <Select
              size="small"
              value={record.status || 'draft'}
              style={{ width: 110 }}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '发布', value: 'published' },
                { label: '下线', value: 'offline' },
              ]}
              onChange={async (status: PublishStatus) => {
                await updateProductCategoryStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该分类？"
              description="删除后不可恢复。"
              onConfirm={async () => {
                await deleteProductCategory(record.id);
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
    [message, mutate],
  );

  const handleSubmit = async (values: ProductCategoryFormValues) => {
    setSubmitting(true);

    try {
      if (editingRecord) {
        await updateProductCategory(editingRecord.id, values);
        message.success('分类更新成功');
      } else {
        await createProductCategory(values);
        message.success('分类创建成功');
      }

      setModalOpen(false);
      setEditingRecord(null);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

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
              placeholder="搜索分类名称 / slug"
              style={{ width: 260 }}
              onSearch={() => form.submit()}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="全部状态"
              style={{ width: 140 }}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
                { label: '已下线', value: 'offline' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sortDirection">
            <Select
              style={{ width: 140 }}
              options={[
                { label: '排序升序', value: 'asc' },
                { label: '排序降序', value: 'desc' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
            >
              新增分类
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<ProductCategoryEntity>
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

      <ProductCategoryModal
        open={modalOpen}
        loading={submitting}
        initialValues={editingRecord}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmit}
      />
    </Space>
  );
}
