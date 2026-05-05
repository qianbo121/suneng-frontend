import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { usePageTitle } from '@/hooks/usePageTitle';
import {
  createCompanyInfo,
  deleteCompanyInfo,
  getCompanyInfoList,
  updateCompanyInfo,
} from '@/services/content';
import { CompanyInfoEntity, CompanyInfoRow } from '@/types/content';

const PRESET_KEYS = [
  'company_name',
  'address',
  'phone',
  'email',
  'fax',
  'wechat_qr',
  'sales_phone',
  'service_phone',
];

type FormValues = {
  rows: CompanyInfoRow[];
};

export function CompanyInfoPage() {
  usePageTitle('公司信息');

  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const { data, isLoading, mutate } = useSWR('company-info', () =>
    getCompanyInfoList({ page: 1, pageSize: 100 }),
  );

  const mergedRows = useMemo(() => {
    const records = data?.items || [];
    const map = new Map(records.map((item) => [item.key, item]));
    const baseRows = PRESET_KEYS.map((key) => {
      const record = map.get(key);
      return {
        id: record?.id,
        key,
        valueZh: record?.valueZh || '',
        valueEn: record?.valueEn || '',
      };
    });

    const extraRows = records
      .filter((item) => !PRESET_KEYS.includes(item.key))
      .map((item) => ({
        id: item.id,
        key: item.key,
        valueZh: item.valueZh || '',
        valueEn: item.valueEn || '',
      }));

    return [...baseRows, ...extraRows];
  }, [data]);

  useEffect(() => {
    form.setFieldsValue({ rows: mergedRows });
  }, [form, mergedRows]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      for (const id of removedIds) {
        await deleteCompanyInfo(id);
      }

      const rows = values.rows
        .map((row) => ({
          ...row,
          key: row.key.trim(),
          valueZh: row.valueZh.trim(),
          valueEn: row.valueEn.trim(),
        }))
        .filter((row) => row.key);

      for (const row of rows) {
        const payload: Omit<CompanyInfoEntity, 'id'> = {
          key: row.key,
          valueZh: row.valueZh || undefined,
          valueEn: row.valueEn || undefined,
        };

        if (row.id) {
          await updateCompanyInfo(row.id, payload);
        } else {
          await createCompanyInfo(payload);
        }
      }

      setRemovedIds([]);
      message.success('公司信息已保存');
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="admin-page-header">
          <div>
            <h2 className="admin-page-title">公司信息设置</h2>
            <p className="admin-page-description">
              集中维护地址、电话、邮箱、传真、二维码等站点基础信息。
            </p>
          </div>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={() => void handleSave()}
          >
            保存全部
          </Button>
        </div>
      </Card>

      <Card loading={isLoading}>
        <Form form={form} layout="vertical">
          <Form.List name="rows">
            {(fields, { add, remove }) => (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {fields.map((field) => (
                  <div key={field.key} className="admin-company-info-row">
                    <Form.Item name={[field.name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="字段 Key"
                      name={[field.name, 'key']}
                      rules={[{ required: true, message: '请输入 key' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="如 phone / address / wechat_qr" />
                    </Form.Item>
                    <Form.Item
                      label="中文值"
                      name={[field.name, 'valueZh']}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="请输入中文值" />
                    </Form.Item>
                    <Form.Item
                      label="英文值"
                      name={[field.name, 'valueEn']}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="请输入英文值" />
                    </Form.Item>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        const row = form.getFieldValue(['rows', field.name]) as
                          | CompanyInfoRow
                          | undefined;
                        if (row?.id) {
                          setRemovedIds((current) => [...current, row.id as number]);
                        }
                        remove(field.name);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      key: '',
                      valueZh: '',
                      valueEn: '',
                    })
                  }
                >
                  新增字段
                </Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Card>
    </Space>
  );
}
