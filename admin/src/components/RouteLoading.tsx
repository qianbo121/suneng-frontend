import { Spin } from 'antd';

export function RouteLoading() {
  return (
    <div className="admin-route-loading">
      <Spin size="large" />
    </div>
  );
}
