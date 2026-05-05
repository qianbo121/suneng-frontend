import { Modal, Form, Input, InputNumber } from 'antd';
import { useEffect } from 'react';

import { ImageUploader } from '@/components/media/ImageUploader';
import { ProductCategoryEntity, ProductCategoryFormValues } from '@/types/product';

type ProductCategoryModalProps = {
  open: boolean;
  loading?: boolean;
  initialValues?: ProductCategoryEntity | null;
  onCancel: () => void;
  onSubmit: (values: ProductCategoryFormValues) => Promise<void>;
};

const INITIAL_VALUES: ProductCategoryFormValues = {
  nameZh: '',
  nameEn: '',
  descriptionZh: '',
  descriptionEn: '',
  coverImage: '',
  iconImage: '',
  slug: '',
  sortOrder: 0,
};

export function ProductCategoryModal({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: ProductCategoryModalProps) {
  const [form] = Form.useForm<ProductCategoryFormValues>();

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        nameZh: initialValues.nameZh,
        nameEn: initialValues.nameEn || '',
        descriptionZh: initialValues.descriptionZh || '',
        descriptionEn: initialValues.descriptionEn || '',
        coverImage: initialValues.coverImage || '',
        iconImage: initialValues.iconImage || '',
        slug: initialValues.slug || '',
        sortOrder: initialValues.sortOrder || 0,
      });
    } else {
      form.setFieldsValue(INITIAL_VALUES);
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={initialValues ? '编辑产品分类' : '新增产品分类'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={760}
      destroyOnClose
    >
      <Form<ProductCategoryFormValues>
        form={form}
        layout="vertical"
        initialValues={INITIAL_VALUES}
        onFinish={onSubmit}
      >
        <div className="admin-form-grid">
          <Form.Item
            label="中文名称"
            name="nameZh"
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input placeholder="请输入中文名称" />
          </Form.Item>
          <Form.Item label="英文名称" name="nameEn">
            <Input placeholder="请输入英文名称" />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input placeholder="可选，留空由后端自动生成" />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item label="中文描述" name="descriptionZh">
          <Input.TextArea rows={4} placeholder="请输入中文描述" />
        </Form.Item>

        <Form.Item label="英文描述" name="descriptionEn">
          <Input.TextArea rows={4} placeholder="请输入英文描述" />
        </Form.Item>

        <div className="admin-form-grid">
          <Form.Item label="封面图" name="coverImage">
            <ImageUploader buttonText="上传封面图" />
          </Form.Item>
          <Form.Item label="图标" name="iconImage">
            <ImageUploader buttonText="上传图标" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
