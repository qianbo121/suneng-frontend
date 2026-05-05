import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';

type StringListEditorProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
};

export function StringListEditor({
  value = [],
  onChange,
  placeholder = '请输入内容',
}: StringListEditorProps) {
  const items = value.length ? value : [''];

  const updateItem = (index: number, nextValue: string) => {
    const nextItems = items.map((item, itemIndex) => (itemIndex === index ? nextValue : item));
    onChange?.(nextItems);
  };

  const addItem = () => {
    onChange?.([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      onChange?.(['']);
      return;
    }

    onChange?.(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Space key={`${index}-${item}`} style={{ display: 'flex' }} align="start">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(event) => updateItem(index, event.target.value)}
            style={{ width: 560 }}
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => removeItem(index)} />
        </Space>
      ))}
      <Button icon={<PlusOutlined />} onClick={addItem}>
        新增一项
      </Button>
    </div>
  );
}
