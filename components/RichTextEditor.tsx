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
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  return (
    <div className="border rounded-lg group">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className={`
          [&_.ql-toolbar.ql-snow]:border-0
          [&_.ql-toolbar.ql-snow]:bg-blue-50 
          [&_.ql-toolbar.ql-snow]:border-b
          [&_.ql-toolbar.ql-snow]:rounded-t-lg
          [&_.ql-toolbar.ql-snow]:border-gray-200
          [&_.ql-container.ql-snow]:border-0
          [&_.ql-editor]:text-base
          [&_.ql-editor]:leading-relaxed
          [&_.ql-editor]:text-gray-500
          [&_.ql-editor]:h-20
          ${className}
        `}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['clean']
          ]
        }}
        placeholder={placeholder}
      />
    </div>
  );
} 