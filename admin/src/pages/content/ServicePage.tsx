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
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createServiceSection,
  deleteServiceSection,
  getServiceSectionList,
  updateServiceSection,
  updateServiceSectionStatus,
} from '@/services/content';
import { ServiceSectionEntity, ServiceSectionFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: ServiceSectionFormValues = {
  sectionKey: '',
  titleZh: '',
  titleEn: '',
  contentZh: '',
  contentEn: '',
  imageUrl: '',
  sortOrder: 0,
  status: 'draft',
};

export function ServicePage() {
  usePageTitle('服务支持');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string; status?: PublishStatus }>();
  const [editForm] = Form.useForm<ServiceSectionFormValues>();
  const [filters, setFilters] = useState<{ keyword: string; status?: PublishStatus }>({
    keyword: '',
    status: undefined,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceSectionEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(['services', page, filters], () =>
    getServiceSectionList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<ServiceSectionEntity>>(
    () => [
      { title: '区块标识', dataIndex: 'sectionKey', width: 160 },
      { title: '中文标题', dataIndex: 'titleZh' },
      {
        title: '配图',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value?: string | null) =>
          value ? <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} /> : '-',
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
                  sectionKey: record.sectionKey,
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  contentZh: record.contentZh || '',
                  contentEn: record.contentEn || '',
                  imageUrl: record.imageUrl || '',
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
                await updateServiceSectionStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该服务区块？"
              onConfirm={async () => {
                await deleteServiceSection(record.id);
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
        sectionKey: values.sectionKey.trim(),
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        contentZh: values.contentZh || undefined,
        contentEn: values.contentEn || undefined,
        imageUrl: values.imageUrl || undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateServiceSection(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateServiceSectionStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createServiceSection(payload);
        if (values.status !== result.status) {
          await updateServiceSectionStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '服务区块更新成功' : '服务区块创建成功');
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
                placeholder="搜索区块标题 / 标识"
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
                新增服务区块
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<ServiceSectionEntity>
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
        title={editingRecord ? '编辑服务区块' : '新增服务区块'}
        width={960}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="区块标识"
            name="sectionKey"
            rules={[{ required: true, message: '请输入区块标识' }]}
          >
            <Input placeholder="如 after-sales / service-advantage" />
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
          <Form.Item label="配图" name="imageUrl">
            <ImageUploader buttonText="上传配图" />
          </Form.Item>
          <Form.Item label="中文内容" name="contentZh">
            <RichTextEditor minHeight={220} />
          </Form.Item>
          <Form.Item label="英文内容" name="contentEn">
            <RichTextEditor minHeight={220} />
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
