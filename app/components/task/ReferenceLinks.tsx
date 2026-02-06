'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import Button from '@/app/components/ui/Button';

interface ReferenceLinksProps {
  label?: string;
  links: string[];
  onChange: (links: string[]) => void;
}

export default function ReferenceLinks({
  label,
  links,
  onChange,
}: ReferenceLinksProps) {
  const [newLink, setNewLink] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    const trimmedLink = newLink.trim();

    if (!trimmedLink) {
      setError('Please enter a URL');
      return;
    }

    // Add https:// if missing
    let urlToAdd = trimmedLink;
    if (!trimmedLink.startsWith('http://') && !trimmedLink.startsWith('https://')) {
      urlToAdd = 'https://' + trimmedLink;
    }

    if (!validateUrl(urlToAdd)) {
      setError('Please enter a valid URL');
      return;
    }

    if (links.includes(urlToAdd)) {
      setError('This link already exists');
      return;
    }

    onChange([...links, urlToAdd]);
    setNewLink('');
    setError('');
  };

  const handleRemoveLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  const getDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      {/* Add link input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newLink}
          onChange={(e) => {
            setNewLink(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className={cn(
            'flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500',
            'focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500',
            'transition-colors',
            error && 'border-red-500'
          )}
        />
        <Button type="button" onClick={handleAddLink} variant="secondary" size="md">
          Add
        </Button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* Link list */}
      {links.length > 0 && (
        <div className="mt-3 space-y-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
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
                className="text-zinc-500 flex-shrink-0"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>

              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-zinc-300 hover:text-orange-500 truncate transition-colors"
                title={link}
              >
                {getDomain(link)}
              </a>

              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                aria-label="Remove link"
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
