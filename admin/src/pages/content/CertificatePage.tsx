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
  createCertificate,
  deleteCertificate,
  getCertificateList,
  updateCertificate,
  updateCertificateStatus,
} from '@/services/content';
import { CertificateCategory, CertificateEntity, CertificateFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const certificateCategoryOptions: { label: string; value: CertificateCategory }[] = [
  { label: '荣誉', value: 'honor' },
  { label: '资质', value: 'qualification' },
  { label: '专利', value: 'patent' },
];

const INITIAL_VALUES: CertificateFormValues = {
  nameZh: '',
  nameEn: '',
  imageUrl: '',
  category: 'honor',
  sortOrder: 0,
  status: 'draft',
};

type Filters = {
  keyword: string;
  category?: CertificateCategory;
  status?: PublishStatus;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  category: undefined,
  status: undefined,
};

export function CertificatePage() {
  usePageTitle('证书管理');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<Filters>();
  const [editForm] = Form.useForm<CertificateFormValues>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CertificateEntity | null>(null);

  const { data, isLoading, mutate } = useSWR(['certificates', page, filters], () =>
    getCertificateList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      category: filters.category,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<CertificateEntity>>(
    () => [
      {
        title: '图片',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value: string) => (
          <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} />
        ),
      },
      { title: '中文名称', dataIndex: 'nameZh' },
      {
        title: '分类',
        dataIndex: 'category',
        width: 100,
        render: (value: CertificateCategory) =>
          certificateCategoryOptions.find((item) => item.value === value)?.label || value,
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
              onClick={() => {
                setEditingRecord(record);
                editForm.setFieldsValue({
                  nameZh: record.nameZh,
                  nameEn: record.nameEn || '',
                  imageUrl: record.imageUrl,
                  category: record.category,
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
                await updateCertificateStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该证书？"
              onConfirm={async () => {
                await deleteCertificate(record.id);
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
        imageUrl: values.imageUrl,
        category: values.category,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateCertificate(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateCertificateStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createCertificate(payload);
        if (values.status !== result.status) {
          await updateCertificateStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '证书更新成功' : '证书创建成功');
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
            initialValues={DEFAULT_FILTERS}
            onFinish={(values) => {
              setFilters(values);
              setPage(1);
            }}
          >
            <Form.Item name="keyword">
              <Input.Search
                allowClear
                placeholder="搜索证书名称"
                style={{ width: 240 }}
                onSearch={() => listForm.submit()}
              />
            </Form.Item>
            <Form.Item name="category">
              <Select
                allowClear
                placeholder="全部分类"
                style={{ width: 140 }}
                options={certificateCategoryOptions}
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
                新增证书
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<CertificateEntity>
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
        title={editingRecord ? '编辑证书' : '新增证书'}
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
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select options={certificateCategoryOptions} />
          </Form.Item>
          <Form.Item
            label="图片"
            name="imageUrl"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <ImageUploader buttonText="上传图片" />
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
