'use client';

import content from '@/lib/fastener-line-content.json';
import type { LineFormField } from '@/lib/production-line-types';
import {
  ProductionLineAnchorNav,
  ProductionLineGallery,
  ProductionLineInquiryForm,
} from './ProductionLineInteractions';

export function FastenerGallery() {
  return (
    <ProductionLineGallery images={content.images} items={content.sections.overview.gallery} />
  );
}
export function FastenerAnchorNav() {
  return <ProductionLineAnchorNav items={content.sectionNavigation} />;
}
export function FastenerInquiryForm() {
  return (
    <ProductionLineInquiryForm
      pageId="fastener-quench-temper-line"
      title={content.sections.overview.title}
      formCopy={{
        ...content.sections.inquiry.form,
        fields: content.sections.inquiry.form.fields.map((field) => ({
          ...field,
          name: field.name as LineFormField['name'],
        })),
      }}
    />
  );
}
