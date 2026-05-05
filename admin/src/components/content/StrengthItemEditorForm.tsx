import { Card, Col, Form, Input, InputNumber, Row, Select, Space, Tabs } from 'antd';
import { useMemo } from 'react';

import { publishStatusOptions } from '@/components/content/ContentStatusTag';
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import { StrengthCategoryEntity, StrengthItemFormValues } from '@/types/content';

type StrengthItemEditorFormProps = {
  form: ReturnType<typeof Form.useForm<StrengthItemFormValues>>[0];
  categories: StrengthCategoryEntity[];
};

export function StrengthItemEditorForm({ form, categories }: StrengthItemEditorFormProps) {
  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        label: item.nameZh,
        value: item.id,
      })),
    [categories],
  );

  return (
    <Form<StrengthItemFormValues> form={form} layout="vertical">
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Card title="基本信息">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="中文标题"
                name="titleZh"
                rules={[{ required: true, message: '请输入中文标题' }]}
              >
                <Input placeholder="请输入中文标题" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="英文标题" name="titleEn">
                <Input placeholder="请输入英文标题" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="所属分类"
                name="categoryId"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类" options={categoryOptions} />
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
                <Select options={publishStatusOptions as { label: string; value: string }[]} />
              </Form.Item>
            </Col>
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

        <Card title="图片素材">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="主图" name="imageUrl">
                <ImageUploader buttonText="上传主图" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="图集" name="imagesJson">
                <ImageUploader multiple maxCount={12} buttonText="上传图集" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="内容描述">
          <Tabs
            items={[
              {
                key: 'zh',
                label: '中文内容',
                children: (
                  <Form.Item name="contentZh" noStyle>
                    <RichTextEditor minHeight={300} />
                  </Form.Item>
                ),
              },
              {
                key: 'en',
                label: '英文内容',
                children: (
                  <Form.Item name="contentEn" noStyle>
                    <RichTextEditor minHeight={300} />
                  </Form.Item>
                ),
              },
            ]}
          />
        </Card>
      </Space>
    </Form>
  );
}
