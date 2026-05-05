import type { ReactElement } from 'react';

export function JsonLd({ id, data }: { id?: string; data: unknown }): ReactElement {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
