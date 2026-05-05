import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ContentStatusTag, publishStatusOptions } from '@/components/content/ContentStatusTag';
import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createDelivery,
  deleteDelivery,
  getDeliveryList,
  updateDelivery,
  updateDeliveryStatus,
} from '@/services/content';
import { DeliveryEntity, DeliveryFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: DeliveryFormValues = {
  titleZh: '',
  titleEn: '',
  descriptionZh: '',
  descriptionEn: '',
  imagesJson: [],
  slug: '',
  deliveryDate: dayjs(),
  sortOrder: 0,
  status: 'draft',
};

export function DeliveryPage() {
  usePageTitle('交车现场');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string; status?: PublishStatus }>();
  const [editForm] = Form.useForm<DeliveryFormValues>();
  const [filters, setFilters] = useState<{ keyword: string; status?: PublishStatus }>({
    keyword: '',
    status: undefined,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeliveryEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(['deliveries', page, filters], () =>
    getDeliveryList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'deliveryDate',
      sortDirection: 'desc',
    }),
  );

  const columns = useMemo<ColumnsType<DeliveryEntity>>(
    () => [
      {
        title: '封面',
        width: 96,
        render: (_, record) => {
          const firstImage = Array.isArray(record.imagesJson) ? record.imagesJson[0] : '';
          return firstImage ? (
            <Image src={firstImage} width={56} height={42} style={{ objectFit: 'cover' }} />
          ) : (
            '-'
          );
        },
      },
      { title: '中文标题', dataIndex: 'titleZh' },
      { title: 'Slug', dataIndex: 'slug' },
      {
        title: '交付日期',
        dataIndex: 'deliveryDate',
        render: (value?: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
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
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  descriptionZh: record.descriptionZh || '',
                  descriptionEn: record.descriptionEn || '',
                  imagesJson: Array.isArray(record.imagesJson)
                    ? record.imagesJson.filter((item): item is string => typeof item === 'string')
                    : [],
                  slug: record.slug,
                  deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : dayjs(),
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
                await updateDeliveryStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该交车现场？"
              onConfirm={async () => {
                await deleteDelivery(record.id);
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
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        descriptionZh: values.descriptionZh.trim() || undefined,
        descriptionEn: values.descriptionEn.trim() || undefined,
        imagesJson: values.imagesJson.filter(Boolean),
        slug: values.slug.trim(),
        deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateDelivery(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateDeliveryStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createDelivery(payload);
        if (values.status !== result.status) {
          await updateDeliveryStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '交车现场更新成功' : '交车现场创建成功');
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
                placeholder="搜索标题 / slug"
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
                新增交车现场
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<DeliveryEntity>
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
        title={editingRecord ? '编辑交车现场' : '新增交车现场'}
        width={820}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
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
          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="图集" name="imagesJson">
            <ImageUploader multiple maxCount={12} buttonText="上传交车图片" />
          </Form.Item>
          <Form.Item label="中文描述" name="descriptionZh">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="英文描述" name="descriptionEn">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="交付日期" name="deliveryDate">
            <DatePicker style={{ width: '100%' }} />
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
