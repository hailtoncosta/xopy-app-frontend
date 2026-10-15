import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';

export function HorizontalScroll({ label, children, className = '', autoPlay = true, compact = false }: {
  label: string;
  children: ReactNode;
  className?: string;
  autoPlay?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const [arrowTop, setArrowTop] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const resumeAt = useRef(0);
  const pauseForInteraction = () => { resumeAt.current = Date.now() + 6000; };

  const move = (direction: number) => {
    const element = ref.current;
    if (!element) return;
    pauseForInteraction();
    const maximum = element.scrollWidth - element.clientWidth;
    const next = direction < 0 && element.scrollLeft <= 1
      ? maximum
      : direction > 0 && element.scrollLeft >= maximum - 2
        ? 0
        : Math.max(0, Math.min(maximum, element.scrollLeft + direction * element.clientWidth * 0.8));
    element.scrollTo({ left: next, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const image = element.querySelector<HTMLElement>('[data-carousel-image]');
    const measure = () => {
      setHasOverflow(element.scrollWidth > element.clientWidth + 1);
      const parentBounds = element.parentElement?.getBoundingClientRect();
      const imageBounds = image?.getBoundingClientRect();
      setArrowTop(imageBounds && parentBounds
        ? imageBounds.top - parentBounds.top + imageBounds.height / 2
        : element.clientHeight / 2);
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);
    if (image) resizeObserver.observe(image);
    if (element.firstElementChild) resizeObserver.observe(element.firstElementChild);
    measure();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let hovered = false;
    let focused = false;
    let touching = false;
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; });
    observer.observe(element);
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') hovered = true; };
    const leave = () => { hovered = false; pauseForInteraction(); };
    const focus = () => { focused = true; };
    const blur = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget);
      pauseForInteraction();
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') touching = true;
      pauseForInteraction();
    };
    const up = () => { touching = false; pauseForInteraction(); };
    const wheel = () => { pauseForInteraction(); };
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', focus);
    element.addEventListener('focusout', blur);
    element.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    element.addEventListener('wheel', wheel, { passive: true });

    const timer = window.setInterval(() => {
      if (!autoPlay || motion.matches || document.hidden || !visible || hovered || focused || touching || Date.now() < resumeAt.current) return;
      const track = element.firstElementChild as HTMLElement | null;
      const first = track?.firstElementChild as HTMLElement | null;
      if (!track || !first) return;
      const maximum = element.scrollWidth - element.clientWidth;
      if (maximum <= 1) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = first.getBoundingClientRect().width + gap;
      element.scrollTo({ left: element.scrollLeft >= maximum - 2 ? 0 : Math.min(maximum, element.scrollLeft + step), behavior: 'smooth' });
    }, 3000);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      resizeObserver.disconnect();
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('focusin', focus);
      element.removeEventListener('focusout', blur);
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      element.removeEventListener('wheel', wheel);
    };
  }, [children, autoPlay]);

  return (
    <div className={`relative min-w-0 max-w-full ${className}`}>
      <div id={id} ref={ref} role="region" aria-roledescription="carrossel" aria-label={label} tabIndex={0} className="overflow-x-auto scrollbar-hide overscroll-x-contain pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600" onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
        {children}
      </div>
      {hasOverflow && <>
        <button type="button" aria-label={`Rolar ${label} para a esquerda`} aria-controls={id} onClick={() => move(-1)} style={{ top: arrowTop }} className={`carousel-arrow left-2 sm:left-3 ${compact ? 'carousel-arrow--compact' : ''}`}>
          <ChevronLeft aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
        </button>
        <button type="button" aria-label={`Rolar ${label} para a direita`} aria-controls={id} onClick={() => move(1)} style={{ top: arrowTop }} className={`carousel-arrow right-2 sm:right-3 ${compact ? 'carousel-arrow--compact' : ''}`}>
          <ChevronRight aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
        </button>
      </>}
    </div>
  );
}
