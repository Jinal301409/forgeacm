/**
 * PageBackground — a different animated backdrop for every page, like Proofline.
 *
 * How it works (plain language):
 *  1. `usePageEffect()` looks at the current URL and decides which effect to show.
 *  2. `<PageBackground />` draws that effect in a fixed layer BEHIND the page content.
 *  3. A dark "scrim" (a see-through black layer) sits on top of the effect so that
 *     text and cards stay easy to read.
 *
 * Safety nets (so it never hurts the user):
 *  - Light theme      -> no effect (the dark animations would clash).
 *  - Phones (<768px)  -> a calm static gradient (saves battery and keeps scrolling smooth).
 *  - Reduced motion / data-saver -> the same calm static gradient.
 *  - Every effect is lazy-loaded, so it only downloads when that page is visited.
 */
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

type EffectName = 'ribbon' | 'curtain' | 'vortex' | 'lumen' | 'arc' | 'orrery' | 'thin' | 'copper';

const Ribbon = lazy(() => import('./RibbonGlow'));
const Curtain = lazy(() => import('./LightCurtain'));
const VortexFx = lazy(() => import('./Vortex'));
const Lumen = lazy(() => import('./LumenCinch'));
const Arc = lazy(() => import('./PredictiveArcEcho'));
const Orrery = lazy(() => import('./SequinOrrery'));
const Thin = lazy(() => import('./ManyThinLight'));
const Copper = lazy(() => import('./CopperCorridor'));

interface EffectConfig {
  name: EffectName;
  /** 0 = show effect at full strength, 1 = hide it completely. Dense pages get a higher number. */
  dim: number;
  /** Colour of the calm fallback glow. */
  glow: string;
}

/** Decide which effect belongs to which page. */
function pickEffect(path: string): EffectConfig | null {
  if (path === '/') return null; // the landing page has its own hero background
  if (path.startsWith('/admin')) return { name: 'thin', dim: 0.55, glow: '#477BFF' };
  if (path.startsWith('/dashboard')) return { name: 'ribbon', dim: 0.5, glow: '#6B2BF5' };
  if (path.startsWith('/policies')) return { name: 'curtain', dim: 0.62, glow: '#477BFF' };
  if (path.startsWith('/schemes')) return { name: 'orrery', dim: 0.62, glow: '#38D9E6' };
  if (path.startsWith('/reports') || path.startsWith('/tracking')) return { name: 'lumen', dim: 0.62, glow: '#F59E0B' };
  if (path.startsWith('/map')) return { name: 'arc', dim: 0.5, glow: '#10B981' };
  if (path.startsWith('/fact-check')) return { name: 'vortex', dim: 0.5, glow: '#8968FF' };
  if (path.startsWith('/applications') || path.startsWith('/notifications')) return { name: 'thin', dim: 0.58, glow: '#38D9E6' };
  if (path.startsWith('/profile') || path.startsWith('/settings')) return { name: 'copper', dim: 0.6, glow: '#F59E0B' };
  if (path.startsWith('/how-it-works')) return { name: 'thin', dim: 0.4, glow: '#38D9E6' };
  if (path.startsWith('/transparency')) return { name: 'arc', dim: 0.4, glow: '#10B981' };
  if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
    return { name: 'vortex', dim: 0.4, glow: '#477BFF' };
  }
  // features, about, privacy, terms and anything else
  return { name: 'curtain', dim: 0.4, glow: '#477BFF' };
}

/** Layouts call this to know whether a background is active (so they can make themselves see-through). */
export function usePageEffect(): EffectConfig | null {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  return useMemo(() => (theme === 'dark' ? pickEffect(pathname) : null), [pathname, theme]);
}

function useCalmMode(): boolean {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia?.('(max-width: 767px)');
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const update = () => setCalm(Boolean(motion?.matches) || Boolean(small?.matches) || Boolean(conn?.saveData));
    update();
    motion?.addEventListener?.('change', update);
    small?.addEventListener?.('change', update);
    return () => {
      motion?.removeEventListener?.('change', update);
      small?.removeEventListener?.('change', update);
    };
  }, []);
  return calm;
}

const fill: React.CSSProperties = { width: '100%', height: '100%', minWidth: 0, minHeight: 0 };

function renderEffect(name: EffectName): React.ReactNode {
  switch (name) {
    case 'ribbon':
      return (
        <Ribbon background="#000000" color1="#6B2BF5" color2="#38BDF8" speed={50} size={100} angle={-180} hover={100} reach={240} style={fill} />
      );
    case 'curtain':
      return <Curtain background="#000000" style={fill} />;
    case 'vortex':
      return (
        <VortexFx
          background="#000000"
          topRadius={475}
          waistRadius={42}
          waistPosition={50}
          bottomRadius={1100}
          twist={1}
          zoom={79}
          speed={10}
          direction="right"
          lineOptions={{ count: 72, color: '#ffffff', glow: 10 }}
          dots={true}
          dotOptions={{ count: 1200, size: 20, color: '#ffffff', glow: 10, flicker: 10 }}
          comets={true}
          cometOptions={{ count: 6, speed: 6, color: '#38D9E6', glow: 6, tail: 19, delay: 8, collide: 6 }}
          repel={false}
          style={fill}
        />
      );
    case 'lumen':
      return <Lumen background="#000000" style={{ ...fill, aspectRatio: 'auto' }} />;
    case 'arc':
      return <Arc background="#000000" style={fill} />;
    case 'orrery':
      return <Orrery background="#060A14" style={{ ...fill, aspectRatio: 'auto' }} />;
    case 'thin':
      return <Thin background="#000000" direction="btt" apexX={100} apexY={50} style={fill} />;
    case 'copper':
      return <Copper background="#131212" style={{ ...fill, aspectRatio: 'auto' }} />;
  }
}

export const PageBackground: React.FC = () => {
  const effect = usePageEffect();
  const calm = useCalmMode();
  if (!effect) return null;

  return (
    <div
      aria-hidden="true"
      className="live-bg-layer"
      style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: '#000', pointerEvents: 'none' }}
    >
      {/* Calm fallback glow (always present underneath, costs almost nothing) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 900px 520px at 50% 0%, ${effect.glow}2E 0%, transparent 70%),
                       radial-gradient(ellipse 600px 600px at 100% 70%, #8968FF1F 0%, transparent 70%)`,
        }}
      />

      {/* The animated effect (key makes React swap it cleanly when the page changes) */}
      {!calm && (
        <div key={effect.name} className="live-bg-fade" style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>{renderEffect(effect.name)}</Suspense>
        </div>
      )}

      {/* Scrim: keeps text readable. Edges get darker like Proofline's vignette. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${effect.dim * 0.55}) 0%, rgba(0,0,0,${effect.dim}) 62%, rgba(0,0,0,${Math.min(effect.dim + 0.25, 0.92)}) 100%)`,
        }}
      />
    </div>
  );
};
