'use client';

import { useEffect, useRef } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const lastValueRef = useRef<string>(value || '');
  const isInternalUpdateRef = useRef(false);
  
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
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
    },
    placeholder: placeholder
  });

  // Sync value prop dengan quill content
  useEffect(() => {
    if (quill) {
      const normalizedValue = value || '';
      const currentContent = quill.root.innerHTML;
      
      // Hanya update jika value prop berbeda dari last known value
      if (normalizedValue !== lastValueRef.current && normalizedValue !== currentContent) {
        isInternalUpdateRef.current = true;
        quill.clipboard.dangerouslyPasteHTML(normalizedValue);
        lastValueRef.current = normalizedValue;
        // Reset flag setelah update selesai
        setTimeout(() => {
          isInternalUpdateRef.current = false;
        }, 0);
      }
    }
  }, [quill, value]);

  // Handle text changes dari quill
  useEffect(() => {
    if (quill) {
      const handler = () => {
        // Skip onChange jika perubahan berasal dari prop update
        if (isInternalUpdateRef.current) {
          return;
        }
        const html = quill.root.innerHTML;
        lastValueRef.current = html;
        onChange(html);
      };

      quill.on('text-change', handler);

      return () => {
        quill.off('text-change', handler);
      };
    }
  }, [quill, onChange]);

  return (
    <div className={`border rounded-lg group ${className || ''}`}>
      <div 
        ref={quillRef}
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
        `}
      />
    </div>
  );
}
