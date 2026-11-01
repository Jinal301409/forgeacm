/**
 * InView — only renders its children while the element is on screen.
 *
 * Why: the WebGL waterfall is GPU-heavy. If we mounted it everywhere at once,
 * low-end phones would struggle. This wrapper mounts it when you scroll near it
 * and unmounts it when you scroll far away, which frees the GPU.
 */
import React, { useEffect, useRef, useState } from 'react';

export const InView: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  rootMargin?: string;
}> = ({ children, className, style, rootMargin = '200px' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : null}
    </div>
  );
};
