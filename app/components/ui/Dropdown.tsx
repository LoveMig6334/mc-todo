'use client';

import { cn } from '@/app/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  id: string;
  label: string;
  color?: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onAddNew?: (name: string) => void;
  placeholder?: string;
  allowAdd?: boolean;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  onAddNew,
  placeholder = 'Select an option',
  allowAdd = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setNewItemName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddNew = () => {
    if (newItemName.trim() && onAddNew) {
      onAddNew(newItemName.trim());
      setNewItemName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNew();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewItemName('');
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-sm',
            'focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500',
            'transition-colors flex items-center justify-between',
            selectedOption ? 'text-white' : 'text-zinc-500'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.color && (
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            {selectedOption?.label || placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform', isOpen && 'rotate-180')}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                  'hover:bg-zinc-700 transition-colors',
                  option.id === value ? 'text-orange-500' : 'text-white'
                )}
              >
                {option.color && (
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </button>
            ))}

            {allowAdd && (
              <>
                <div className="my-1 border-t border-zinc-700" />
                {isAdding ? (
                  <div className="px-3 py-2 flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="New category name"
                      className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="rounded bg-orange-500 px-2 py-1 text-sm text-white hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="w-full px-3 py-2 text-left text-sm text-orange-500 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add new category
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
