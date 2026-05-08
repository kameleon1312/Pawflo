'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pl">
      <body style={{ backgroundColor: '#1B1411', color: '#F8EFE2', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Coś poszło nie tak</h1>
        <button
          onClick={reset}
          style={{ background: '#F08A8A', color: '#1B1411', border: 'none', borderRadius: '9999px', padding: '12px 28px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
