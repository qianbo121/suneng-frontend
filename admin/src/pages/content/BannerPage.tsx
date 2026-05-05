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
  Switch,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { ContentStatusTag, publishStatusOptions } from '@/components/content/ContentStatusTag';
import { ImageUploader } from '@/components/media/ImageUploader';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createBanner,
  deleteBanner,
  getBannerList,
  updateBanner,
  updateBannerStatus,
} from '@/services/content';
import { BannerEntity, BannerFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

type Filters = {
  keyword: string;
  sectionKey: string;
  status?: PublishStatus;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  sectionKey: '',
  status: undefined,
};

const INITIAL_VALUES: BannerFormValues = {
  sectionKey: '',
  titleZh: '',
  titleEn: '',
  subtitleZh: '',
  subtitleEn: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  isActive: true,
  sortOrder: 0,
  status: 'draft',
};

export function BannerPage() {
  usePageTitle('轮播图管理');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<Filters>();
  const [editForm] = Form.useForm<BannerFormValues>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BannerEntity | null>(null);

  const { data, isLoading, mutate } = useSWR(['banners', page, filters], () =>
    getBannerList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      sectionKey: filters.sectionKey,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<BannerEntity>>(
    () => [
      {
        title: '图片',
        dataIndex: 'imageUrl',
        width: 96,
        render: (value: string) => (
          <Image src={value} width={56} height={42} style={{ objectFit: 'cover' }} />
        ),
      },
      { title: '中文标题', dataIndex: 'titleZh' },
      {
        title: '分组标识',
        dataIndex: 'sectionKey',
        render: (value?: string | null) => value || '-',
      },
      {
        title: '启用',
        dataIndex: 'isActive',
        width: 80,
        render: (value: boolean) => (value ? '是' : '否'),
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
                  sectionKey: record.sectionKey || '',
                  titleZh: record.titleZh,
                  titleEn: record.titleEn || '',
                  subtitleZh: record.subtitleZh || '',
                  subtitleEn: record.subtitleEn || '',
                  imageUrl: record.imageUrl,
                  mobileImageUrl: record.mobileImageUrl || '',
                  linkUrl: record.linkUrl || '',
                  isActive: record.isActive,
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
                await updateBannerStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该轮播图？"
              onConfirm={async () => {
                await deleteBanner(record.id);
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
        sectionKey: values.sectionKey.trim() || undefined,
        titleZh: values.titleZh.trim(),
        titleEn: values.titleEn.trim() || undefined,
        subtitleZh: values.subtitleZh.trim() || undefined,
        subtitleEn: values.subtitleEn.trim() || undefined,
        imageUrl: values.imageUrl,
        mobileImageUrl: values.mobileImageUrl || undefined,
        linkUrl: values.linkUrl.trim() || undefined,
        isActive: values.isActive,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateBanner(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateBannerStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createBanner(payload);
        if (values.status !== result.status) {
          await updateBannerStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '轮播图更新成功' : '轮播图创建成功');
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
                placeholder="搜索标题"
                style={{ width: 240 }}
                onSearch={() => listForm.submit()}
              />
            </Form.Item>
            <Form.Item name="sectionKey">
              <Input placeholder="分组标识" style={{ width: 180 }} />
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
                新增轮播图
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<BannerEntity>
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
        title={editingRecord ? '编辑轮播图' : '新增轮播图'}
        width={820}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item label="分组标识" name="sectionKey">
            <Input placeholder="如 home-hero" />
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
          <Form.Item label="中文副标题" name="subtitleZh">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="英文副标题" name="subtitleEn">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="主图"
            name="imageUrl"
            rules={[{ required: true, message: '请上传主图' }]}
          >
            <ImageUploader buttonText="上传主图" />
          </Form.Item>
          <Form.Item label="移动端图片" name="mobileImageUrl">
            <ImageUploader buttonText="上传移动端图" />
          </Form.Item>
          <Form.Item label="跳转链接" name="linkUrl">
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="启用" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={publishStatusOptions as { label: string; value: string }[]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
