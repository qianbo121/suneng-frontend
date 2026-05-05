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
  createSalesOutlet,
  deleteSalesOutlet,
  getSalesOutletList,
  updateSalesOutlet,
  updateSalesOutletStatus,
} from '@/services/content';
import { SalesOutletEntity, SalesOutletFormValues } from '@/types/content';
import { PublishStatus } from '@/types/product';

const INITIAL_VALUES: SalesOutletFormValues = {
  regionZh: '',
  regionEn: '',
  cityZh: '',
  cityEn: '',
  addressZh: '',
  addressEn: '',
  phone: '',
  lat: undefined,
  lng: undefined,
  sortOrder: 0,
  status: 'draft',
};

export function SalesOutletPage() {
  usePageTitle('销售网点');

  const { message } = App.useApp();
  const [listForm] = Form.useForm<{ keyword: string; status?: PublishStatus }>();
  const [editForm] = Form.useForm<SalesOutletFormValues>();
  const [filters, setFilters] = useState<{ keyword: string; status?: PublishStatus }>({
    keyword: '',
    status: undefined,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalesOutletEntity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(['sales-outlets', page, filters], () =>
    getSalesOutletList({
      page,
      pageSize: 10,
      keyword: filters.keyword,
      status: filters.status,
      sortBy: 'sortOrder',
      sortDirection: 'asc',
    }),
  );

  const columns = useMemo<ColumnsType<SalesOutletEntity>>(
    () => [
      { title: '地区', dataIndex: 'regionZh', width: 120 },
      { title: '城市', dataIndex: 'cityZh', width: 120 },
      { title: '地址', dataIndex: 'addressZh' },
      {
        title: '电话',
        dataIndex: 'phone',
        width: 140,
        render: (value?: string | null) => value || '-',
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
                  regionZh: record.regionZh,
                  regionEn: record.regionEn || '',
                  cityZh: record.cityZh,
                  cityEn: record.cityEn || '',
                  addressZh: record.addressZh,
                  addressEn: record.addressEn || '',
                  phone: record.phone || '',
                  lat: record.lat ?? undefined,
                  lng: record.lng ?? undefined,
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
                await updateSalesOutletStatus(record.id, status);
                message.success('状态已更新');
                await mutate();
              }}
            />
            <Popconfirm
              title="确认删除该销售网点？"
              onConfirm={async () => {
                await deleteSalesOutlet(record.id);
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
        regionZh: values.regionZh.trim(),
        regionEn: values.regionEn.trim() || undefined,
        cityZh: values.cityZh.trim(),
        cityEn: values.cityEn.trim() || undefined,
        addressZh: values.addressZh.trim(),
        addressEn: values.addressEn.trim() || undefined,
        phone: values.phone.trim() || undefined,
        lat: values.lat ?? undefined,
        lng: values.lng ?? undefined,
        sortOrder: Number(values.sortOrder) || 0,
      };

      if (editingRecord) {
        const result = await updateSalesOutlet(editingRecord.id, payload);
        if (values.status !== result.status) {
          await updateSalesOutletStatus(editingRecord.id, values.status);
        }
      } else {
        const result = await createSalesOutlet(payload);
        if (values.status !== result.status) {
          await updateSalesOutletStatus(result.id, values.status);
        }
      }

      message.success(editingRecord ? '网点更新成功' : '网点创建成功');
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
                placeholder="搜索地区 / 城市 / 地址"
                style={{ width: 280 }}
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
                新增网点
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<SalesOutletEntity>
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
        title={editingRecord ? '编辑销售网点' : '新增销售网点'}
        width={760}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSubmit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="地区（中文）"
            name="regionZh"
            rules={[{ required: true, message: '请输入地区' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="地区（英文）" name="regionEn">
            <Input />
          </Form.Item>
          <Form.Item
            label="城市（中文）"
            name="cityZh"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="城市（英文）" name="cityEn">
            <Input />
          </Form.Item>
          <Form.Item
            label="地址（中文）"
            name="addressZh"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="地址（英文）" name="addressEn">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="电话" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="纬度" name="lat">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="经度" name="lng">
            <InputNumber style={{ width: '100%' }} />
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
