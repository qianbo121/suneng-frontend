import { Spin } from 'antd';
import { useEffect, useState } from 'react';

import { getGlobalLoadingState, subscribeGlobalLoading } from '@/services/loading';

export function GlobalLoading() {
  const [visible, setVisible] = useState(getGlobalLoadingState());

  useEffect(() => {
    return subscribeGlobalLoading(() => {
      setVisible(getGlobalLoadingState());
    });
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="admin-global-loading">
      <Spin size="large" />
    </div>
  );
}
