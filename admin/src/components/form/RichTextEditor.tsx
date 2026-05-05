import 'react-quill/dist/quill.snow.css';

import { App } from 'antd';
import { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';

import { uploadSingleFile } from '@/services/upload';

type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: number;
};

export function RichTextEditor({ value = '', onChange, minHeight = 240 }: RichTextEditorProps) {
  const { message } = App.useApp();
  const quillRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: async () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;

              try {
                const imageUrl = await uploadSingleFile(file);
                const editor = quillRef.current?.getEditor();
                const range = editor?.getSelection(true);

                if (editor) {
                  editor.insertEmbed(range?.index || 0, 'image', imageUrl);
                  editor.setSelection((range?.index || 0) + 1, 0);
                }
              } catch (error) {
                message.error(error instanceof Error ? error.message : '图片上传失败');
              }
            };
          },
        },
      },
    }),
    [message],
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'bullet',
      'blockquote',
      'link',
      'image',
      'color',
      'background',
    ],
    [],
  );

  return (
    <div className="admin-quill">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ minHeight }}
      />
    </div>
  );
}
