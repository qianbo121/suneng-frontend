import { Card, Space, Tag, Typography } from 'antd';
import { ReactNode } from 'react';

type PagePlaceholderProps = {
  title: string;
  description: string;
  tags?: string[];
  extra?: ReactNode;
};

export function PagePlaceholder({ title, description, tags = [], extra }: PagePlaceholderProps) {
  return (
    <Card>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3}>{title}</Typography.Title>
          <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
        </div>
        <Space wrap>
          {tags.map((tag) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </Space>
        {extra}
      </Space>
    </Card>
  );
}
