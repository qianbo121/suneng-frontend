export type LineVariant = 'mesh' | 'wire-strip' | 'handling' | 'aluminum' | 'curing';

export type LineImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  optimized?: boolean;
};
export type LineGalleryItem = {
  id: string;
  label: string;
  alt: string;
  thumbnailAssetId: string;
  fullAssetId: string | null;
};
export type LineFormField = {
  name: 'workpiece_material' | 'target_performance' | 'target_output' | 'contact_method';
  label: string;
  placeholder: string;
  required: boolean;
};
export type LineForm = {
  id: string;
  fields: LineFormField[];
  submitLabel: string;
  helperText: string;
};
export type LineTable = {
  caption: string;
  columns: { key: string; label: string }[];
  rows: { item: string; cells: string[] }[];
};
type Heading = { title: string; subtitle?: string };
type Illustration = { imageAssetId: string | null; imageAlt?: string };
export type LineFlow = { title: string; steps: string[]; note: string };

export type ProductionLineContent = {
  pageId: string;
  variant: LineVariant;
  seo: { title: string; description: string };
  sectionNavigation: { label: string; href: string }[];
  images: Record<string, LineImage>;
  projectReference?: {
    title: string;
    description: string;
    table: LineTable;
    note: string;
    href: string;
  };
  sections: {
    overview: Heading & {
      description: string;
      facts: { label: string; value: string }[];
      gallery: LineGalleryItem[];
      actions: { label: string; href: string; style: string }[];
    };
    workpieces: Heading & {
      cards: (Illustration & { id: string; title: string; description: string })[];
      note?: string;
    };
    process: Heading &
      Illustration & {
        mode: 'linear' | 'routes' | 'cell';
        stages: { id: string; title: string; description: string }[];
        routes?: LineFlow[];
        note: string;
      };
    comparison?: Heading & {
      schemes: (Illustration & { id: string; title: string; description: string })[];
      table: LineTable;
    };
    configuration: Heading & {
      table: LineTable;
      inputs?: { title: string; description: string }[];
      notes: string[];
      action: { label: string; href: string };
    };
    'site-conditions': Heading &
      Illustration & {
        imageCaption?: string;
        requirements: { title: string; description: string }[];
        capacity?: string;
      };
    'delivery-scope': Heading &
      Illustration & {
        contentTitle: string;
        items: { label: string; value: string }[];
        note: string;
      };
    acceptance: Heading & {
      columns: { id: string; title: string; description: string }[];
      stages: { id: string; order: number; label: string }[];
      productNote: string;
      note: string;
    };
    faq: Heading & {
      items: { id: string; question: string; answer: string; defaultOpen: boolean }[];
      relatedGroups: {
        id: string;
        title: string;
        links: { label: string; href: string | null }[];
      }[];
    };
    inquiry: { title: string; description: string; form: LineForm };
  };
};
