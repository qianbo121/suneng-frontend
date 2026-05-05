import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';

import { KeyValueRow } from '@/types/product';

type KeyValueEditorProps = {
  value?: KeyValueRow[];
  onChange?: (value: KeyValueRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
};

export function KeyValueEditor({
  value = [],
  onChange,
  keyPlaceholder = '参数名',
  valuePlaceholder = '参数值',
}: KeyValueEditorProps) {
  const rows = value.length ? value : [{ key: '', value: '' }];

  const updateRow = (index: number, field: keyof KeyValueRow, nextValue: string) => {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: nextValue,
          }
        : row,
    );

    onChange?.(nextRows);
  };

  const addRow = () => {
    onChange?.([...rows, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      onChange?.([{ key: '', value: '' }]);
      return;
    }

    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <Space key={`${index}-${row.key}`} style={{ display: 'flex' }} align="start">
          <Input
            value={row.key}
            placeholder={keyPlaceholder}
            onChange={(event) => updateRow(index, 'key', event.target.value)}
            style={{ width: 220 }}
          />
          <Input
            value={row.value}
            placeholder={valuePlaceholder}
            onChange={(event) => updateRow(index, 'value', event.target.value)}
            style={{ width: 320 }}
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => removeRow(index)} />
        </Space>
      ))}
      <Button icon={<PlusOutlined />} onClick={addRow}>
        新增一行
      </Button>
    </div>
  );
}
