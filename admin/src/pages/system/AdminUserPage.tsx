import { EditOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/hooks/use-auth';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createAdminUser,
  getAdminUserList,
  toggleAdminUser,
  updateAdminUser,
  updateAdminUserPassword,
} from '@/services/admin-users';
import { AdminRole, AdminUser, AdminUserFormValues } from '@/types/auth';

type Filters = {
  keyword: string;
  role?: AdminRole;
};

const DEFAULT_FILTERS: Filters = {
  keyword: '',
  role: undefined,
};

const roleOptions: { label: string; value: AdminRole }[] = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '编辑', value: 'editor' },
];

const INITIAL_VALUES: AdminUserFormValues = {
  username: '',
  password: '',
  role: 'editor',
  isActive: true,
};

export function AdminUserPage() {
  usePageTitle('管理员管理');

  const { user } = useAuth();
  const { message } = App.useApp();
  const [listForm] = Form.useForm<Filters>();
  const [editForm] = Form.useForm<AdminUserFormValues>();
  const [passwordForm] = Form.useForm<{ password: string }>();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdminUser | null>(null);
  const [passwordRecord, setPasswordRecord] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const { data, isLoading, mutate } = useSWR(
    isSuperAdmin ? ['admin-users', page, filters] : null,
    () =>
      getAdminUserList({
        page,
        pageSize: 10,
        keyword: filters.keyword,
        role: filters.role,
      }),
  );

  const columns = useMemo<ColumnsType<AdminUser>>(
    () => [
      { title: '用户名', dataIndex: 'username' },
      {
        title: '角色',
        dataIndex: 'role',
        width: 140,
        render: (value: AdminRole) => (
          <Tag color={value === 'super_admin' ? 'red' : 'blue'}>
            {value === 'super_admin' ? '超级管理员' : '编辑'}
          </Tag>
        ),
      },
      {
        title: '启用状态',
        dataIndex: 'isActive',
        width: 110,
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '禁用'}</Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (value?: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
      },
      {
        title: '操作',
        width: 320,
        render: (_, record) => (
          <Space wrap>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecord(record);
                editForm.setFieldsValue({
                  username: record.username,
                  role: record.role,
                  isActive: record.isActive,
                });
                setOpen(true);
              }}
            >
              编辑
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => {
                setPasswordRecord(record);
                passwordForm.resetFields();
                setPasswordOpen(true);
              }}
            >
              重置密码
            </Button>
            <Popconfirm
              title={record.isActive ? '确认禁用该管理员？' : '确认启用该管理员？'}
              onConfirm={async () => {
                await toggleAdminUser(record.id);
                message.success('状态已更新');
                await mutate();
              }}
            >
              <Button>{record.isActive ? '禁用' : '启用'}</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [editForm, message, mutate, passwordForm],
  );

  if (!isSuperAdmin) {
    return (
      <Result
        status="403"
        title="无权限访问"
        subTitle="只有 super_admin 可以访问管理员管理模块。"
      />
    );
  }

  const handleSaveUser = async () => {
    const values = await editForm.validateFields();
    setSubmitting(true);
    try {
      if (editingRecord) {
        await updateAdminUser(editingRecord.id, {
          username: values.username.trim(),
          role: values.role,
          isActive: values.isActive,
        });
        message.success('管理员更新成功');
      } else {
        await createAdminUser({
          username: values.username.trim(),
          password: values.password?.trim() || '',
          role: values.role,
          isActive: values.isActive,
        });
        message.success('管理员创建成功');
      }

      setOpen(false);
      setEditingRecord(null);
      editForm.setFieldsValue(INITIAL_VALUES);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const values = await passwordForm.validateFields();
    if (!passwordRecord) return;

    setSubmitting(true);
    try {
      await updateAdminUserPassword(passwordRecord.id, values.password.trim());
      message.success('密码已重置');
      setPasswordOpen(false);
      setPasswordRecord(null);
      passwordForm.resetFields();
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
                placeholder="搜索用户名"
                style={{ width: 240 }}
                onSearch={() => listForm.submit()}
              />
            </Form.Item>
            <Form.Item name="role">
              <Select
                allowClear
                placeholder="全部角色"
                style={{ width: 160 }}
                options={roleOptions}
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
                新增管理员
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table<AdminUser>
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
        title={editingRecord ? '编辑管理员' : '新增管理员'}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSaveUser()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={INITIAL_VALUES}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          {!editingRecord ? (
            <Form.Item
              label="初始密码"
              name="password"
              rules={[
                { required: true, message: '请输入初始密码' },
                { min: 6, message: '密码至少 6 位' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item label="启用状态" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={passwordOpen}
        title={passwordRecord ? `重置密码：${passwordRecord.username}` : '重置密码'}
        onCancel={() => setPasswordOpen(false)}
        onOk={() => void handleResetPassword()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
