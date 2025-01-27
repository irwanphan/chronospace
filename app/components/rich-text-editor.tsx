'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="text-gray-500 p-4">Loading editor...</div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className="
          [&_.ql-toolbar.ql-snow]:border-0
          [&_.ql-toolbar.ql-snow]:bg-blue-50 
          [&_.ql-toolbar.ql-snow]:border-b
          [&_.ql-toolbar.ql-snow]:border-gray-200
          [&_.ql-container.ql-snow]:border-0
          [&_.ql-editor]:text-base
          [&_.ql-editor]:leading-relaxed
          [&_.ql-editor]:text-gray-500
          [&_.ql-editor]:h-20
        "
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ]
        }}
        placeholder={placeholder}
      />
    </div>
  );
} 