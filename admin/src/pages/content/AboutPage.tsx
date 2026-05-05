import { Card, Tabs } from 'antd';

import { AboutChairmanManager } from '@/components/content/AboutChairmanManager';
import { AboutCultureManager } from '@/components/content/AboutCultureManager';
import { AboutSectionManager } from '@/components/content/AboutSectionManager';
import { AboutTimelineManager } from '@/components/content/AboutTimelineManager';
import { usePageTitle } from '@/hooks/usePageTitle';

export function AboutPage() {
  usePageTitle('关于我们');

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'sections',
            label: '公司简介',
            children: <AboutSectionManager />,
          },
          {
            key: 'chairman',
            label: '董事长致辞',
            children: <AboutChairmanManager />,
          },
          {
            key: 'culture',
            label: '企业文化',
            children: <AboutCultureManager />,
          },
          {
            key: 'timeline',
            label: '发展历程',
            children: <AboutTimelineManager />,
          },
        ]}
      />
    </Card>
  );
}
