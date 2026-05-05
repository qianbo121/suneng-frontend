import { Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, Tabs } from 'antd';
import { useMemo } from 'react';

import { KeyValueEditor } from '@/components/form/KeyValueEditor';
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { StringListEditor } from '@/components/form/StringListEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import { ProductCategoryEntity, ProductFormValues } from '@/types/product';

type ProductEditorFormProps = {
  form: ReturnType<typeof Form.useForm<ProductFormValues>>[0];
  categories: ProductCategoryEntity[];
};

export function ProductEditorForm({ form, categories }: ProductEditorFormProps) {
  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        label: item.nameZh,
        value: item.id,
      })),
    [categories],
  );

  return (
    <Form<ProductFormValues> form={form} layout="vertical">
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card title="基本信息">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="中文名称"
                name="nameZh"
                rules={[{ required: true, message: '请输入中文名称' }]}
              >
                <Input placeholder="请输入中文名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="英文名称" name="nameEn">
                <Input placeholder="请输入英文名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="型号" name="model">
                <Input placeholder="请输入型号" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="产品分类"
                name="categoryId"
                rules={[{ required: true, message: '请选择产品分类' }]}
              >
                <Select placeholder="请选择产品分类" options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Slug" name="slug">
                <Input placeholder="可选，留空由后端自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="排序" name="sortOrder">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select
                  options={[
                    { label: '草稿', value: 'draft' },
                    { label: '发布', value: 'published' },
                    { label: '下线', value: 'offline' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="热销产品" name="isHot" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="中文摘要" name="summaryZh">
                <Input.TextArea rows={4} placeholder="请输入中文摘要" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="英文摘要" name="summaryEn">
                <Input.TextArea rows={4} placeholder="请输入英文摘要" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="产品图片">
          <Form.Item label="图片列表" name="imagesJson">
            <ImageUploader multiple maxCount={12} buttonText="上传产品图片" />
          </Form.Item>
        </Card>

        <Card title="产品描述">
          <Tabs
            items={[
              {
                key: 'zh',
                label: '中文描述',
                children: (
                  <Form.Item name="descriptionZh" noStyle>
                    <RichTextEditor minHeight={260} />
                  </Form.Item>
                ),
              },
              {
                key: 'en',
                label: '英文描述',
                children: (
                  <Form.Item name="descriptionEn" noStyle>
                    <RichTextEditor minHeight={260} />
                  </Form.Item>
                ),
              },
            ]}
          />
        </Card>

        <Card title="技术参数">
          <Form.Item name="specsRows" noStyle>
            <KeyValueEditor keyPlaceholder="参数名" valuePlaceholder="参数值" />
          </Form.Item>
        </Card>

        <Card title="产品特点">
          <Form.Item name="features" noStyle>
            <StringListEditor placeholder="请输入产品特点" />
          </Form.Item>
        </Card>

        <Card title="SEO 信息">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 标题（中文）" name="seoTitleZh">
                <Input placeholder="请输入 SEO 标题（中文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 标题（英文）" name="seoTitleEn">
                <Input placeholder="请输入 SEO 标题（英文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 描述（中文）" name="seoDescriptionZh">
                <Input.TextArea rows={4} placeholder="请输入 SEO 描述（中文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 描述（英文）" name="seoDescriptionEn">
                <Input.TextArea rows={4} placeholder="请输入 SEO 描述（英文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 关键词（中文）" name="seoKeywordsZh">
                <Input placeholder="请输入 SEO 关键词（中文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="SEO 关键词（英文）" name="seoKeywordsEn">
                <Input placeholder="请输入 SEO 关键词（英文）" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="OG 图片" name="ogImage">
                <ImageUploader buttonText="上传 OG 图片" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Space>
    </Form>
  );
}
