'use client';

import { cn, getPriorityColor, getPriorityLabel } from '@/app/lib/utils';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showPriorityLabel?: boolean;
}

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  showPriorityLabel = true,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">{label}</label>
          {showPriorityLabel && (
            <span className={cn('text-sm font-medium', getPriorityColor(value))}>
              {value} - {getPriorityLabel(value)}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-orange-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-orange-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #3f3f46 ${percentage}%, #3f3f46 100%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
