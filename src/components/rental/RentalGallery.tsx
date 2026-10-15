import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export default function RentalGallery({ images, name, compact = false }: { images: string[]; name: string; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const touch = useRef<number | null>(null);
  const signature = images.join('|');
  useEffect(() => { setIndex(0); setFailed([]); }, [signature]);
  const valid = images.filter(src => !failed.includes(src));
  const active = Math.min(index, Math.max(0, valid.length - 1));
  const move = (step: number) => setIndex((active + step + valid.length) % valid.length);
  return <div className="w-full">
    <div className={`relative bg-gray-100 overflow-hidden ${compact ? 'h-48' : 'aspect-[3/2] rounded-lg'}`} onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touch.current !== null && valid.length > 1) { const distance = e.changedTouches[0].clientX - touch.current; if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1); } touch.current = null; }}>
      {valid.length ? <img src={valid[active]} alt={`${name} — foto ${active + 1}`} loading={compact ? 'lazy' : 'eager'} className="w-full h-full object-contain" onError={() => setFailed(previous => [...previous, valid[active]])} />
        : <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500"><ImageOff className="h-8 w-8" /><span className="text-sm">Foto indisponível</span></div>}
      {valid.length > 1 && <>
        <button type="button" aria-label={`Foto anterior de ${name}`} onClick={e => { e.stopPropagation(); move(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-orange-600/70 backdrop-blur-md p-2 text-white shadow-md hover:bg-orange-600"><ChevronLeft className="w-5 h-5" /></button>
        <button type="button" aria-label={`Próxima foto de ${name}`} onClick={e => { e.stopPropagation(); move(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-orange-600/70 backdrop-blur-md p-2 text-white shadow-md hover:bg-orange-600"><ChevronRight className="w-5 h-5" /></button>
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{active + 1}/{valid.length}</span>
      </>}
    </div>
    {!compact && valid.length > 1 && <div className="flex gap-2 overflow-x-auto pt-3">{valid.map((src, i) => <button key={src} type="button" aria-label={`Ver foto ${i + 1} de ${name}`} aria-pressed={i === active} onClick={() => setIndex(i)} className={`shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden ${i === active ? 'border-orange-600' : 'border-gray-200'}`}><img src={src} alt="" className="w-full h-full object-contain" /></button>)}</div>}
  </div>;
}
