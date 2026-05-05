import { FileTextOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

import { PagePlaceholder } from '@/components/PagePlaceholder';

export function SiteSettingPage() {
  return (
    <PagePlaceholder
      title="站点设置"
      description="预留企业信息、页脚配置、二维码和主题配置。"
      tags={['公司信息', '页脚', '主题色']}
      extra={
        <Space>
          <Button icon={<FileTextOutlined />}>预留配置表单</Button>
        </Space>
      }
    />
  );
}
