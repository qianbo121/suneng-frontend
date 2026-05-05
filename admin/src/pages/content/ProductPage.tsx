import { PagePlaceholder } from '@/components/PagePlaceholder';

export function ProductPage() {
  return (
    <PagePlaceholder
      title="产品管理"
      description="预留产品分类、产品列表和产品详情编辑入口。"
      tags={['分类树', '列表', '详情表单']}
    />
  );
}
