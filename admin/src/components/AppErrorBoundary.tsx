import { Button, Result } from 'antd';
import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep a minimal boundary for framework bootstrapping.
    console.error(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="admin-route-loading">
          <Result
            status="error"
            title="后台发生异常"
            subTitle="请刷新页面，或重新进入后台系统。"
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                刷新页面
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
