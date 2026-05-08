'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
};

export function FadeIn({ children, className, delay = 0, direction = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const offset = 24;
  const initial = {
    opacity: 0,
    y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
    x: direction === 'left' ? offset : direction === 'right' ? -offset : 0,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
