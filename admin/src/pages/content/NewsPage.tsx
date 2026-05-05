import { PagePlaceholder } from '@/components/PagePlaceholder';

export function NewsPage() {
  return (
    <PagePlaceholder
      title="新闻管理"
      description="预留新闻分类、新闻内容和 SEO 配置入口。"
      tags={['分类', '富文本', 'SEO']}
    />
  );
}
