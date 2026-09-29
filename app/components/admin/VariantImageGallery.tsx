'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, GripVertical, Plus, X } from 'lucide-react';
import { getOptimizedCloudinaryImage } from '@/lib/cloudinaryImage';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  onAdd: () => void;
}

export default function VariantImageGallery({ images, onChange, onAdd }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ from: number; to: number; x: number; y: number; dx: number; dy: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const moveImage = (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return;
    const reordered = [...images];
    const [image] = reordered.splice(from, 1);
    reordered.splice(to, 0, image);
    onChange(reordered);
    setAnnouncement(`Image moved from position ${from + 1} to ${to + 1}.`);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>, index: number) => {
    if (event.button !== 0 || !event.isPrimary || (event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ from: index, to: index, x: event.clientX, y: event.clientY, dx: 0, dy: 0 });
  };

  const trackDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    let to = drag.to;
    gridRef.current?.querySelectorAll<HTMLElement>('[data-image-index]').forEach((tile) => {
      const rect = tile.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
        to = Number(tile.dataset.imageIndex);
      }
    });
    setDrag({ ...drag, to, dx: event.clientX - drag.x, dy: event.clientY - drag.y });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-slate-500">Drag images to arrange them. The first image is the main image. Save the product to keep your order.</p>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div ref={gridRef} className="grid grid-cols-2 gap-3">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} data-image-index={index} className={`relative rounded-2xl ${drag?.to === index ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
            <div
              onPointerDown={(event) => startDrag(event, index)}
              onPointerMove={trackDrag}
              onPointerUp={() => {
                if (drag) moveImage(drag.from, drag.to);
                setDrag(null);
              }}
              onPointerCancel={() => setDrag(null)}
              onLostPointerCapture={() => setDrag(null)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setDrag(null);
              }}
              style={drag?.from === index ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.04)`, zIndex: 20 } : undefined}
              className={`relative aspect-square touch-none select-none overflow-hidden rounded-2xl bg-slate-100 shadow-md ${drag?.from === index ? 'cursor-grabbing shadow-xl' : 'cursor-grab'}`}
            >
              <img src={getOptimizedCloudinaryImage(url, 420)} alt={`Variant image ${index + 1}`} draggable={false} className="pointer-events-none h-full w-full object-cover" loading="lazy" decoding="async" />
              <span className="pointer-events-none absolute left-2 top-2 rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white">{index === 0 ? '1 · Main' : index + 1}</span>
              <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => onChange(images.filter((_, i) => i !== index))} className="absolute right-1 top-1 rounded-full bg-white/95 p-2 text-slate-600 shadow-sm hover:bg-red-600 hover:text-white focus-visible:outline-2 focus-visible:outline-orange-500"><X size={14} /></button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white/95 px-1 py-1">
                <button type="button" aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => moveImage(index, index - 1)} className="rounded-lg p-2 text-slate-600 hover:bg-orange-100 disabled:opacity-25"><ArrowLeft size={14} /></button>
                <GripVertical size={16} className="pointer-events-none text-slate-400" />
                <button type="button" aria-label={`Move image ${index + 1} later`} disabled={index === images.length - 1} onClick={() => moveImage(index, index + 1)} className="rounded-lg p-2 text-slate-600 hover:bg-orange-100 disabled:opacity-25"><ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={onAdd} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-gray-400 transition-colors hover:border-orange-500 hover:text-orange-500"><Plus size={20} /><span className="text-[10px] font-bold uppercase">Add Image</span></button>
      </div>
    </div>
  );
}
