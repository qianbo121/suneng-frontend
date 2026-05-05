import { DeleteOutlined, EyeOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Image, Modal, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import { useMemo, useState } from 'react';

import { uploadSingleFile } from '@/services/upload';

type ImageUploaderProps = {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  maxCount?: number;
  buttonText?: string;
};

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxCount = multiple ? 10 : 1,
  buttonText = '上传图片',
}: ImageUploaderProps) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const images = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);

  const updateImages = (nextImages: string[]) => {
    if (multiple) {
      onChange?.(nextImages);
      return;
    }

    onChange?.(nextImages[0] || '');
  };

  const handleUpload: UploadProps['beforeUpload'] = async (file) => {
    if (images.length >= maxCount) {
      message.warning(`最多上传 ${maxCount} 张图片`);
      return Upload.LIST_IGNORE;
    }

    setUploading(true);

    try {
      const url = await uploadSingleFile(file as RcFile);
      updateImages(multiple ? [...images, url] : [url]);
      message.success('上传成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }

    return Upload.LIST_IGNORE;
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    event.preventDefault();

    const dragIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;

    const nextImages = [...images];
    const [dragged] = nextImages.splice(dragIndex, 1);
    nextImages.splice(dropIndex, 0, dragged);
    updateImages(nextImages);
  };

  return (
    <div className="space-y-4">
      <Upload
        accept="image/*,.pdf"
        showUploadList={false}
        beforeUpload={handleUpload}
        multiple={multiple}
      >
        <Button icon={<PlusOutlined />} loading={uploading} disabled={images.length >= maxCount}>
          {buttonText}
        </Button>
      </Upload>

      {images.length ? (
        <div className="admin-upload-grid">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="admin-upload-item"
              draggable={multiple}
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
            >
              {multiple ? <HolderOutlined className="admin-upload-drag-handle" /> : null}
              <div className="admin-upload-thumb">
                <Image src={image} alt={`upload-${index}`} preview={false} />
              </div>
              <div className="admin-upload-actions">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewImage(image)}
                />
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    updateImages(images.filter((_, imageIndex) => imageIndex !== index))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Modal open={Boolean(previewImage)} footer={null} onCancel={() => setPreviewImage('')}>
        <Image src={previewImage} alt="preview" width="100%" />
      </Modal>
    </div>
  );
}
