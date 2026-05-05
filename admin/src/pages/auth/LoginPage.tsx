import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoginPayload } from '@/types/auth';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  usePageTitle('后台登录');

  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const redirectTo = (location.state as LocationState | null)?.from || '/dashboard';

  const handleFinish = async (values: LoginPayload) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      await login(values);
      message.success('登录成功');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const fallback = '登录失败，请检查用户名和密码。';
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-panel">
        <div className="admin-auth-intro">
          <p className="admin-auth-eyebrow">TIANTENG ADMIN</p>
          <h1>企业官网后台管理系统</h1>
          <p>
            统一接入内容管理、站点配置、留言处理与管理员权限控制。本阶段完成登录、路由、
            权限守卫与请求底座。
          </p>
        </div>

        <Card className="admin-auth-card" bordered={false}>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            登录后台
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            请输入管理员账号和密码进入控制台。
          </Typography.Paragraph>

          {errorMessage ? (
            <Alert style={{ marginBottom: 20 }} type="error" showIcon message={errorMessage} />
          ) : null}

          <Form<LoginPayload>
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ username: 'admin' }}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                size="large"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              登录并进入仪表盘
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
