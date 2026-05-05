import { PagePlaceholder } from '@/components/PagePlaceholder';
import { usePageTitle } from '@/hooks/usePageTitle';

type FeaturePlaceholderPageProps = {
  title: string;
  description: string;
  tags?: string[];
};

export function FeaturePlaceholderPage({
  title,
  description,
  tags = [],
}: FeaturePlaceholderPageProps) {
  usePageTitle(title);

  return <PagePlaceholder title={title} description={description} tags={tags} />;
}
