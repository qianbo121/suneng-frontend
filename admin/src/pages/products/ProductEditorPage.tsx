import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Skeleton, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import { ProductEditorForm } from '@/components/products/ProductEditorForm';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createProduct,
  getAllProductCategories,
  getProductDetail,
  updateProduct,
  updateProductStatus,
} from '@/services/products';
import { KeyValueRow, ProductEntity, ProductFormValues } from '@/types/product';

const INITIAL_VALUES: ProductFormValues = {
  nameZh: '',
  nameEn: '',
  model: '',
  categoryId: null,
  slug: '',
  sortOrder: 0,
  isHot: false,
  summaryZh: '',
  summaryEn: '',
  descriptionZh: '',
  descriptionEn: '',
  imagesJson: [],
  specsRows: [{ key: '', value: '' }],
  features: [''],
  seoTitleZh: '',
  seoTitleEn: '',
  seoDescriptionZh: '',
  seoDescriptionEn: '',
  seoKeywordsZh: '',
  seoKeywordsEn: '',
  ogImage: '',
  status: 'draft',
};

function mapSpecsToRows(specsJson?: ProductEntity['specsJson']): KeyValueRow[] {
  if (!specsJson || Array.isArray(specsJson) || typeof specsJson !== 'object') {
    return [{ key: '', value: '' }];
  }

  const rows = Object.entries(specsJson).map(([key, value]) => ({
    key,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));

  return rows.length ? rows : [{ key: '', value: '' }];
}

function mapFeatures(featuresJson?: ProductEntity['featuresJson']) {
  if (Array.isArray(featuresJson)) {
    const rows = featuresJson
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return String(
            (item as Record<string, unknown>).content ||
              (item as Record<string, unknown>).title ||
              '',
          );
        }
        return '';
      })
      .filter(Boolean);

    return rows.length ? rows : [''];
  }

  return [''];
}

function mapProductToFormValues(product?: ProductEntity): ProductFormValues {
  if (!product) return INITIAL_VALUES;

  return {
    nameZh: product.nameZh,
    nameEn: product.nameEn || '',
    model: product.model || '',
    categoryId: product.categoryId,
    slug: product.slug || '',
    sortOrder: product.sortOrder || 0,
    isHot: Boolean(product.isHot),
    summaryZh: product.summaryZh || '',
    summaryEn: product.summaryEn || '',
    descriptionZh: product.descriptionZh || '',
    descriptionEn: product.descriptionEn || '',
    imagesJson: Array.isArray(product.imagesJson)
      ? product.imagesJson.filter((item): item is string => typeof item === 'string')
      : [],
    specsRows: mapSpecsToRows(product.specsJson),
    features: mapFeatures(product.featuresJson),
    seoTitleZh: product.seoTitleZh || '',
    seoTitleEn: product.seoTitleEn || '',
    seoDescriptionZh: product.seoDescriptionZh || '',
    seoDescriptionEn: product.seoDescriptionEn || '',
    seoKeywordsZh: product.seoKeywordsZh || '',
    seoKeywordsEn: product.seoKeywordsEn || '',
    ogImage: product.ogImage || '',
    status: product.status || 'draft',
  };
}

function mapFormToPayload(values: ProductFormValues) {
  return {
    categoryId: Number(values.categoryId),
    nameZh: values.nameZh.trim(),
    nameEn: values.nameEn.trim() || undefined,
    model: values.model.trim() || undefined,
    summaryZh: values.summaryZh.trim() || undefined,
    summaryEn: values.summaryEn.trim() || undefined,
    descriptionZh: values.descriptionZh || undefined,
    descriptionEn: values.descriptionEn || undefined,
    specsJson: values.specsRows.reduce<Record<string, string>>((accumulator, item) => {
      const key = item.key.trim();
      const value = item.value.trim();

      if (key && value) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {}),
    featuresJson: values.features.map((item) => item.trim()).filter(Boolean),
    imagesJson: values.imagesJson.filter(Boolean),
    isHot: values.isHot,
    slug: values.slug.trim() || undefined,
    seoTitleZh: values.seoTitleZh.trim() || undefined,
    seoTitleEn: values.seoTitleEn.trim() || undefined,
    seoDescriptionZh: values.seoDescriptionZh.trim() || undefined,
    seoDescriptionEn: values.seoDescriptionEn.trim() || undefined,
    seoKeywordsZh: values.seoKeywordsZh.trim() || undefined,
    seoKeywordsEn: values.seoKeywordsEn.trim() || undefined,
    ogImage: values.ogImage || undefined,
    sortOrder: values.sortOrder || 0,
    status: values.status,
  };
}

export function ProductEditorPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const productId = params.id ? Number(params.id) : null;
  const isEdit = Boolean(productId);
  usePageTitle(isEdit ? '编辑产品' : '新增产品');

  const { message } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const { data: categories = [] } = useSWR('product-categories-all', getAllProductCategories);
  const { data: detail, isLoading } = useSWR(
    isEdit && productId ? ['product-detail', productId] : null,
    () => getProductDetail(productId as number),
  );

  useEffect(() => {
    form.setFieldsValue(mapProductToFormValues(detail));
  }, [detail, form]);

  const pageTitle = useMemo(() => (isEdit ? '编辑产品' : '新增产品'), [isEdit]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    setSubmitting(true);
    try {
      const payload = mapFormToPayload(values);

      if (isEdit && productId) {
        const result = await updateProduct(productId, payload);
        if (values.status && values.status !== result.status) {
          await updateProductStatus(productId, values.status);
        }
        message.success('产品更新成功');
      } else {
        const result = await createProduct(payload);
        if (values.status && values.status !== result.status) {
          await updateProductStatus(result.id, values.status);
        }
        message.success('产品创建成功');
      }

      navigate('/products');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="admin-page-header">
          <div>
            <h2 className="admin-page-title">{pageTitle}</h2>
            <p className="admin-page-description">
              维护产品基础信息、图片、富文本描述、技术参数与 SEO 配置。
            </p>
          </div>
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              保存产品
            </Button>
          </Space>
        </div>
      </Card>

      {isLoading && isEdit ? (
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <ProductEditorForm form={form} categories={categories} />
      )}
    </Space>
  );
}
