/**
 * HeroBackground — the cinematic full-bleed backdrop behind the landing hero.
 *
 * It copies Proofline's hero look: a looping dark video with a vignette that
 * fades into the black page below.
 *
 * Fallback chain (so the page never looks broken):
 *   1. Video plays            -> used as-is.
 *   2. Video fails / is slow  -> the WebGL "light waterfall" (ZirconTorrent) is shown instead.
 *   3. Reduced-motion or data-saver -> a calm static gradient, nothing moves.
 *   4. Light theme            -> soft pastel gradient (the dark video would clash).
 */
import React, { Suspense, lazy, useEffect, useState } from 'react';

// Same looping clip that Proofline uses on its landing page.
const HERO_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4';

// Loaded only when needed, so it does not slow down the first page load.
const ZirconTorrent = lazy(() => import('./ZirconTorrent'));

function usePrefersCalm(): boolean {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const update = () => setCalm(Boolean(mq?.matches) || Boolean(conn?.saveData));
    update();
    mq?.addEventListener?.('change', update);
    return () => mq?.removeEventListener?.('change', update);
  }, []);
  return calm;
}

export const HeroBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const calm = usePrefersCalm();
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // If the video has not started within 4 seconds, bring in the WebGL fallback.
  useEffect(() => {
    if (!isDark || calm) return;
    const id = window.setTimeout(() => setTimedOut(true), 4000);
    return () => window.clearTimeout(id);
  }, [isDark, calm]);

  const showFallback = isDark && !calm && (videoFailed || (!videoReady && timedOut));

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: isDark ? '#000' : 'linear-gradient(180deg, #EEF2FF 0%, #F4F6FB 60%, #F4F6FB 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Layer 1: WebGL waterfall fallback */}
      {showFallback && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
          <Suspense fallback={null}>
            <ZirconTorrent background="#000000" style={{ width: '100%', height: '100%' }} />
          </Suspense>
        </div>
      )}

      {/* Layer 2: Proofline's looping video (dark theme only) */}
      {isDark && !calm && !videoFailed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {/* Calm / light: soft brand-coloured orbs instead of motion */}
      {(calm || !isDark) && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(0,240,255,0.12) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 800px 500px at 50% 0%, rgba(71,123,255,0.14) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'radial-gradient(ellipse 500px 500px at 100% 60%, rgba(137,104,255,0.10) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 500px 500px at 100% 60%, rgba(137,104,255,0.10) 0%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* Vignette: darkens the top for the navbar and fades to the page colour at the bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.88) 85%, #000000 100%)'
            : 'linear-gradient(180deg, rgba(244,246,251,0) 60%, #F4F6FB 100%)',
        }}
      />
    </div>
  );
};
