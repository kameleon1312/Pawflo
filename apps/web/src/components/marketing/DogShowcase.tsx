'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const MODEL_URL = '/models/chihuahua.glb';

// Loaded on demand: three.js is several hundred KB and must not weigh on the first paint
const DogScene = dynamic(() => import('@/components/marketing/DogScene'), { ssr: false });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * 3D dog running along a trail. Renders nothing (and downloads nothing) unless
 * the model file exists, WebGL works, and the section is near the viewport.
 */
export function DogShowcase() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = wrapper.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) setNear(true);
        setOnScreen(entry.isIntersecting);
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only once we are near: is there a model at all, and can this device draw it?
  useEffect(() => {
    if (!near || available) return;
    let cancelled = false;
    if (!hasWebGL()) return;
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled && res.ok) setAvailable(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [near, available]);

  return (
    <div ref={wrapper} aria-hidden="true">
      {available && (
        <div className="relative mt-16 h-44 sm:h-60">
          {/* The trail: an inset groove the dog runs along, tying the three steps into one walk */}
          <div className="absolute inset-x-0 bottom-1 h-3 rounded-full shadow-neu-inset" />
          <div className="absolute inset-0">
            <DogScene active={onScreen} reducedMotion={reducedMotion} />
          </div>
        </div>
      )}
    </div>
  );
}
