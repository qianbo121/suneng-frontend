import { Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Tabs } from 'antd';
import { useMemo } from 'react';

import { RichTextEditor } from '@/components/form/RichTextEditor';
import { ImageUploader } from '@/components/media/ImageUploader';
import { NewsCategoryEntity, NewsFormValues } from '@/types/news';

type NewsEditorFormProps = {
  form: ReturnType<typeof Form.useForm<NewsFormValues>>[0];
  categories: NewsCategoryEntity[];
};

export function NewsEditorForm({ form, categories }: NewsEditorFormProps) {
  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        label: item.nameZh,
        value: item.id,
      })),
    [categories],
  );

  return (
    <Form<NewsFormValues> form={form} layout="vertical">
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
              <Form.Item label="Slug" name="slug">
                <Input placeholder="可选，留空由后端自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="新闻分类"
                name="categoryId"
                rules={[{ required: true, message: '请选择新闻分类' }]}
              >
                <Select placeholder="请选择新闻分类" options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="发布日期" name="publishDate">
                <DatePicker style={{ width: '100%' }} showTime />
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
                    { label: '下架', value: 'offline' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="封面图">
          <Form.Item label="封面图" name="coverImage">
            <ImageUploader buttonText="上传封面图" />
          </Form.Item>
        </Card>

        <Card title="新闻摘要">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="中文摘要" name="summaryZh">
                <Input.TextArea rows={5} placeholder="请输入中文摘要" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="英文摘要" name="summaryEn">
                <Input.TextArea rows={5} placeholder="请输入英文摘要" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="正文内容">
          <Tabs
            items={[
              {
                key: 'zh',
                label: '中文正文',
                children: (
                  <Form.Item name="contentZh" noStyle>
                    <RichTextEditor minHeight={320} />
                  </Form.Item>
                ),
              },
              {
                key: 'en',
                label: '英文正文',
                children: (
                  <Form.Item name="contentEn" noStyle>
                    <RichTextEditor minHeight={320} />
                  </Form.Item>
                ),
              },
            ]}
          />
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
