import {
  MessageOutlined,
  NotificationOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, List, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { usePageTitle } from '@/hooks/usePageTitle';
import { getContactMessageList } from '@/services/content';
import { getDashboardStats } from '@/services/dashboard';

export function DashboardPage() {
  usePageTitle('仪表盘');

  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useSWR('dashboard-stats', getDashboardStats);
  const { data: messages, isLoading: messagesLoading } = useSWR('dashboard-recent-messages', () =>
    getContactMessageList({ page: 1, pageSize: 5 }),
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-dashboard-card">
            <Statistic
              title="产品数"
              value={stats?.productCount ?? 0}
              prefix={<ShoppingOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-dashboard-card">
            <Statistic
              title="新闻数"
              value={stats?.newsCount ?? 0}
              prefix={<NotificationOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-dashboard-card">
            <Statistic
              title="未读留言数"
              value={stats?.unreadContactCount ?? 0}
              prefix={<MessageOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="admin-dashboard-card">
            <Statistic
              title="今日访问量"
              value={stats?.todayVisitCount ?? 0}
              prefix={<UserOutlined />}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="最近 5 条留言"
        extra={
          <Button type="link" onClick={() => navigate('/contact-messages')}>
            查看全部
          </Button>
        }
      >
        {messagesLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <List
            dataSource={messages?.items || []}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="detail" type="link" onClick={() => navigate('/contact-messages')}>
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size={8}>
                      <span>{item.name}</span>
                      <Typography.Text type="secondary">{item.phone}</Typography.Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary" ellipsis style={{ maxWidth: '100%' }}>
                        {item.message}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'}
                      </Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
