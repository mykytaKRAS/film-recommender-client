import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange: (val: number) => void;
  max?: number;
  size?: number;
}

export function StarRating({ value, onChange, max = 10, size = 20 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const active = hovered ?? value;

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={star <= active ? 'text-amber-400' : 'text-gray-600'}
            fill={star <= active ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      <span className="ml-2 text-gray-400 text-sm self-center">{active}/10</span>
    </div>
  );
}