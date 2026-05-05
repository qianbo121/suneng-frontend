import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Image, Input, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { usePageTitle } from '@/hooks/usePageTitle';
import {
  deleteProduct,
  getAllProductCategories,
  getProductList,
  updateProductStatus,
} from '@/services/products';
import { ProductCategoryEntity, ProductEntity, PublishStatus } from '@/types/product';

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

function getFirstImage(record: ProductEntity) {
  return Array.isArray(record.imagesJson) && record.imagesJson[0]
    ? record.imagesJson[0]
    : record.ogImage || '';
}

export function ProductListPage() {
  usePageTitle('产品管理');

  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<Filters>();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useSWR('product-categories-all', getAllProductCategories);
  const { data, isLoading, mutate } = useSWR(['products', page, filters], () =>
    getProductList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      categoryId: filters.categoryId,
      status: filters.status,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    }),
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((item: ProductCategoryEntity) => ({
        label: item.nameZh,
        value: item.id,
      })),
    [categories],
  );

  const columns = useMemo<ColumnsType<ProductEntity>>(
    () => [
      {
        title: '图片',
        width: 100,
        render: (_, record) =>
          getFirstImage(record) ? (
            <Image
              src={getFirstImage(record)}
              width={56}
              height={42}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            '-'
          ),
      },
      {
        title: '产品名称',
        dataIndex: 'nameZh',
        render: (_, record) => (
          <div>
            <div>{record.nameZh}</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>{record.model || '-'}</div>
          </div>
        ),
      },
      {
        title: '分类',
        dataIndex: ['category', 'nameZh'],
        render: (value?: string) => value || '-',
      },
      {
        title: '热销',
        dataIndex: 'isHot',
        width: 90,
        render: (value?: boolean) => (value ? <Tag color="red">热销</Tag> : '-'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 110,
        render: (status: PublishStatus) => {
          if (status === 'published') return <Tag color="green">已发布</Tag>;
          if (status === 'offline') return <Tag color="orange">已下线</Tag>;
          return <Tag>草稿</Tag>;
        },
      },
      {
        title: '排序',
        dataIndex: 'sortOrder',
        width: 90,
      },
      {
        title: '操作',
        key: 'actions',
        width: 280,
        render: (_, record) => (
          <Space wrap>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)}>
              编辑
            </Button>
            <Select
              size="small"
              value={record.status}
              style={{ width: 110 }}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '发布', value: 'published' },
                { label: '下线', value: 'offline' },
              ]}
              onChange={async (status: PublishStatus) => {
                await updateProductStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该产品？"
              description="删除后不可恢复。"
              onConfirm={async () => {
                await deleteProduct(record.id);
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
              placeholder="搜索名称 / 型号 / slug"
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
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
                { label: '已下线', value: 'offline' },
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
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/products/new')}
            >
              新增产品
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<ProductEntity>
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
