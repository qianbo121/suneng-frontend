import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
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
import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createPartner,
  deletePartner,
  getPartnerList,
  updatePartner,
  updatePartnerStatus,
} from '@/services/content';
import { PartnerEntity, PartnerFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: PartnerFormValues = {
  name: '',
  logoUrl: '',
  website: '',
  sortOrder: 0,
  status: 'draft',
};

export function PartnerPage() {
  usePageTitle('合作伙伴');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string; status?: PublishStatus }>();
  const [editForm] = Form.useForm<PartnerFormValues>();
  const [filters, setFilters] = useState<{ keyword: string; status?: PublishStatus }>({
    keyword: '',
    status: undefined,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PartnerEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(['partners', page, filters], () =>
    getPartnerList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<PartnerEntity>>(
    () => [
      {
        title: 'Logo',
        dataIndex: 'logoUrl',
        width: 96,
        render: (value: string) => (
          <Image src={value} width={56} height={42} style={{ objectFit: 'contain' }} />
        ),
      },
      { title: '企业名称', dataIndex: 'name' },
      { title: '官网链接', dataIndex: 'website', render: (value?: string | null) => value || '-' },
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
                  name: record.name,
                  logoUrl: record.logoUrl,
                  website: record.website || '',
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
                await updatePartnerStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该合作伙伴？"
              onConfirm={async () => {
                await deletePartner(record.id);
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
        name: values.name.trim(),
        logoUrl: values.logoUrl,
        website: values.website.trim() || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updatePartner(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updatePartnerStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createPartner(payload);
        if (values.status !== result.status) {
          await updatePartnerStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '合作伙伴更新成功' : '合作伙伴创建成功');
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
                placeholder="搜索企业名称"
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
                新增合作伙伴
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<PartnerEntity>
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
        title={editingRecord ? '编辑合作伙伴' : '新增合作伙伴'}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="企业名称"
            name="name"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Logo"
            name="logoUrl"
            rules={[{ required: true, message: '请上传 Logo' }]}
          >
            <ImageUploader buttonText="上传 Logo" />
          </Form.Item>
          <Form.Item label="官网链接" name="website">
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
