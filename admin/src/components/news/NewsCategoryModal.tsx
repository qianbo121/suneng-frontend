import { Form, Input, InputNumber, Modal } from 'antd';
import { useEffect } from 'react';

import { NewsCategoryEntity, NewsCategoryFormValues } from '@/types/news';

type NewsCategoryModalProps = {
  open: boolean;
  loading?: boolean;
  initialValues?: NewsCategoryEntity | null;
  onCancel: () => void;
  onSubmit: (values: NewsCategoryFormValues) => Promise<void>;
};

const INITIAL_VALUES: NewsCategoryFormValues = {
  nameZh: '',
  nameEn: '',
  slug: '',
  sortOrder: 0,
};

export function NewsCategoryModal({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: NewsCategoryModalProps) {
  const [form] = Form.useForm<NewsCategoryFormValues>();

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        nameZh: initialValues.nameZh,
        nameEn: initialValues.nameEn || '',
        slug: initialValues.slug || '',
        sortOrder: initialValues.sortOrder || 0,
      });
    } else {
      form.setFieldsValue(INITIAL_VALUES);
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={initialValues ? '编辑新闻分类' : '新增新闻分类'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={640}
      destroyOnClose
    >
      <Form<NewsCategoryFormValues>
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
      </Form>
    </Modal>
  );
}
