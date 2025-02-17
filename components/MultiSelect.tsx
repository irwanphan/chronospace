'use client';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  readonly?: boolean;
}

export default function MultiSelect({ options, value, onChange, placeholder = 'Select...', readonly = false }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = options.filter(option => value.includes(option.id));
  const availableOptions = options.filter(
    option => !value.includes(option.id) && 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeOption = (optionId: string) => {
    onChange(value.filter(id => id !== optionId));
  };

  const addOption = (optionId: string) => {
    onChange([...value, optionId]);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="min-h-[42px] px-3 py-2 border rounded-lg cursor-text flex flex-wrap gap-2 items-center"
        onClick={() => !readonly && setIsOpen(true)}
      >
        {selectedOptions.map(option => (
          <span
            key={option.id}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
          >
            {option.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeOption(option.id);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 outline-none min-w-[120px]"
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && !readonly && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {availableOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          ) : (
            availableOptions.map(option => (
              <button
                key={option.id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => addOption(option.id)}
              >
                {option.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
} 