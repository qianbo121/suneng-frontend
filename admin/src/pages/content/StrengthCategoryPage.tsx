import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
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
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createStrengthCategory,
  deleteStrengthCategory,
  getStrengthCategoryList,
  updateStrengthCategory,
  updateStrengthCategoryStatus,
} from '@/services/content';
import { StrengthCategoryEntity, StrengthCategoryFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: StrengthCategoryFormValues = {
  nameZh: '',
  nameEn: '',
  slug: '',
  sortOrder: 0,
  status: 'draft',
};

export function StrengthCategoryPage() {
  usePageTitle('实力展示分类');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string; status?: PublishStatus }>();
  const [editForm] = Form.useForm<StrengthCategoryFormValues>();
  const [filters, setFilters] = useState<{ keyword: string; status?: PublishStatus }>({
    keyword: '',
    status: undefined,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StrengthCategoryEntity | null>(null);

  const { data, isLoading, mutate } = useSWR(['strength-categories', page, filters], () =>
    getStrengthCategoryList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<StrengthCategoryEntity>>(
    () => [
      { title: '中文名称', dataIndex: 'nameZh' },
      { title: '英文名称', dataIndex: 'nameEn', render: (value?: string | null) => value || '-' },
      { title: 'Slug', dataIndex: 'slug' },
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
                editForm.setFieldsValue({
                  nameZh: record.nameZh,
                  nameEn: record.nameEn || '',
                  slug: record.slug,
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
                await updateStrengthCategoryStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该分类？"
              onConfirm={async () => {
                await deleteStrengthCategory(record.id);
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
        nameZh: values.nameZh.trim(),
        nameEn: values.nameEn.trim() || undefined,
        slug: values.slug.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateStrengthCategory(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateStrengthCategoryStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createStrengthCategory(payload);
        if (values.status !== result.status) {
          await updateStrengthCategoryStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '分类更新成功' : '分类创建成功');
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
            initialValues={filters}
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
                onSearch={() => listForm.submit()}
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
                onClick={() => {
                  setEditingRecord(null);
                  editForm.setFieldsValue(INITIAL_VALUES);
                  setOpen(true);
                }}
              >
                新增分类
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<StrengthCategoryEntity>
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
        title={editingRecord ? '编辑分类' : '新增分类'}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="中文名称"
            name="nameZh"
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="英文名称" name="nameEn">
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }]}>
            <Input />
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
