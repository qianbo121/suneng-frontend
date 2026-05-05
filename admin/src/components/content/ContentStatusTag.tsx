import { Tag } from 'antd';

import { ContactMessageStatus } from '@/types/content';
import { PublishStatus } from '@/types/product';

export const publishStatusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '发布', value: 'published' },
  { label: '下线', value: 'offline' },
] as { label: string; value: PublishStatus }[];

export function ContentStatusTag({ status }: { status?: PublishStatus }) {
  if (status === 'published') return <Tag color="green">已发布</Tag>;
  if (status === 'offline') return <Tag color="orange">已下线</Tag>;
  return <Tag>草稿</Tag>;
}

export const contactStatusOptions = [
  { label: '新留言', value: 'new' },
  { label: '处理中', value: 'processing' },
  { label: '已解决', value: 'resolved' },
  { label: '垃圾留言', value: 'spam' },
] as { label: string; value: ContactMessageStatus }[];

export function ContactStatusTag({ status }: { status: ContactMessageStatus }) {
  if (status === 'resolved') return <Tag color="green">已解决</Tag>;
  if (status === 'processing') return <Tag color="blue">处理中</Tag>;
  if (status === 'spam') return <Tag color="red">垃圾留言</Tag>;
  return <Tag color="gold">新留言</Tag>;
}
