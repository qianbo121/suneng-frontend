import { LockOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Space } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { changeOwnPassword } from '@/services/auth';

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordPage() {
  usePageTitle('修改密码');

  const navigate = useNavigate();
  const { message } = App.useApp();
  const { logout } = useAuth();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await changeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功，请重新登录');
      logout();
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720 }}>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">修改密码</h2>
          <p className="admin-page-description">请输入当前密码并设置新的登录密码。</p>
        </div>
      </div>
      <Form<FormValues> form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => void handleSubmit()}
          >
            保存新密码
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
