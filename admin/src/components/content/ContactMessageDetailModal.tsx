import { Descriptions, Modal, Tag } from 'antd';

import { ContactStatusTag } from '@/components/content/ContentStatusTag';
import { ContactMessageEntity } from '@/types/content';

type ContactMessageDetailModalProps = {
  open: boolean;
  record: ContactMessageEntity | null;
  onCancel: () => void;
};

export function ContactMessageDetailModal({
  open,
  record,
  onCancel,
}: ContactMessageDetailModalProps) {
  return (
    <Modal open={open} title="留言详情" onCancel={onCancel} footer={null} width={760}>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="姓名">{record?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{record?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="电话">{record?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="公司">{record?.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {record ? <ContactStatusTag status={record.status} /> : '-'}
          <Tag style={{ marginLeft: 8 }} color={record?.isRead ? 'green' : 'gold'}>
            {record?.isRead ? '已读' : '未读'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {record?.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="留言内容">
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>{record?.message || '-'}</div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
