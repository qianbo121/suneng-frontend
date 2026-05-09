import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  AdminMenuRoute,
  adminMenuRoutes,
  filterAdminMenuRoutesByRole,
  findAdminRoute,
  menuIconMap,
} from '@/app/router/route-config';
import { useAuth } from '@/hooks/use-auth';

const { Header, Sider, Content } = Layout;

function buildMenuItems(role?: 'super_admin' | 'editor') {
  return filterAdminMenuRoutesByRole(adminMenuRoutes, role).map((route) => ({
    key: route.children?.length ? route.key : route.path,
    icon: route.icon,
    label: route.label,
    children: route.children?.map((child: AdminMenuRoute) => ({
      key: child.path,
      icon: menuIconMap[child.key],
      label: child.label,
    })),
  }));
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = useMemo(() => buildMenuItems(user?.role), [user?.role]);
  const currentRoute = findAdminRoute(location.pathname);
  const selectedKeys = useMemo(
    () => [currentRoute?.path || location.pathname],
    [currentRoute?.path, location.pathname],
  );
  const openKeys = useMemo(() => {
    const parent = adminMenuRoutes.find((route: AdminMenuRoute) =>
      route.children?.some((child: AdminMenuRoute) => child.path === currentRoute?.path),
    );
    return parent ? [parent.key] : [];
  }, [currentRoute?.path]);
  const [menuOpenKeys, setMenuOpenKeys] = useState<string[]>(openKeys);

  useEffect(() => {
    setMenuOpenKeys(openKeys);
  }, [openKeys]);

  return (
    <Layout className="admin-layout">
      <Sider
        width={264}
        collapsedWidth={84}
        collapsible
        trigger={null}
        collapsed={collapsed}
        className="admin-sider"
      >
        <div className="admin-logo">
          <div className="admin-logo-mark">SN</div>
          {!collapsed ? (
            <div>
              <p className="admin-logo-title">Suneng Admin</p>
              <p className="admin-logo-subtitle">企业官网管理系统</p>
            </div>
          ) : null}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : menuOpenKeys}
          onOpenChange={(keys) => setMenuOpenKeys(keys as string[])}
          items={menuItems}
          onClick={({ key }) => {
            if (String(key).startsWith('/')) {
              navigate(String(key));
            }
          }}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="admin-header-left">
            <Button
              type="text"
              className="admin-collapse-button"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                {currentRoute?.label || '仪表盘'}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: '4px 0 0', color: '#64748b' }}>
                {currentRoute?.description || '制造业企业官网后台管理系统基础框架'}
              </Typography.Paragraph>
            </div>
          </div>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'change-password',
                  icon: <UserOutlined />,
                  label: '修改密码',
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                },
              ],
              onClick: ({ key }) => {
                if (key === 'change-password') {
                  navigate('/profile/password');
                }
                if (key === 'logout') {
                  logout();
                  navigate('/login', { replace: true });
                }
              },
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button type="button" className="admin-user-trigger">
              <Space size={12}>
                <Avatar icon={<UserOutlined />} />
                <div className="admin-user-meta">
                  <span className="admin-user-name">{user?.username || 'admin'}</span>
                  <span className="admin-user-role">{user?.role || 'editor'}</span>
                </div>
              </Space>
            </button>
          </Dropdown>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
