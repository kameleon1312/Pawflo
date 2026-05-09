'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// useSearchParams() requires Suspense in Next.js 14 App Router static pre-rendering
export default function ResetPasswordPage() {
  return (
    <PageShell>
      <Suspense fallback={<LoadingState />}>
        <ResetPasswordForm />
      </Suspense>
    </PageShell>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!token) {
    return (
      <Notice
        ok={false}
        title="Nieprawidłowy link"
        body="Brak tokenu w adresie URL. Sprawdź link z e-maila lub poproś o nowy reset hasła."
      />
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setErrorMsg('Hasła muszą być identyczne.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, passwordConfirm }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setErrorMsg(body.error ?? 'Coś poszło nie tak. Spróbuj ponownie.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Błąd połączenia z serwerem.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <Notice
        ok={true}
        title="Hasło zmienione!"
        body="Możesz teraz zalogować się do aplikacji PawFlo za pomocą nowego hasła."
      />
    );
  }

  return (
    <div className="max-w-md w-full space-y-6">
      <h1
        className="font-serif text-3xl font-bold text-center"
        style={{ color: '#1B1411', fontVariationSettings: '"opsz" 144' }}
      >
        Nowe hasło
      </h1>
      <p className="text-center text-sm" style={{ color: '#2A1F19' }}>
        Ustaw nowe hasło dla swojego konta PawFlo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nowe hasło"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Minimum 12 znaków"
          autoComplete="new-password"
        />
        <Field
          label="Powtórz hasło"
          type="password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          placeholder="Powtórz nowe hasło"
          autoComplete="new-password"
        />

        {(status === 'error' || errorMsg) && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: '#F08A8A', color: '#FAF4E9' }}
        >
          {status === 'loading' ? 'Zapisywanie…' : 'Zmień hasło'}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: '#2A1F19' }}>
        <Link href="/" className="underline hover:opacity-70">
          Wróć do strony głównej
        </Link>
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-md w-full flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#F08A8A', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF4E9' }}
    >
      {children}
    </main>
  );
}

function Notice({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className="max-w-md w-full text-center space-y-6">
      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
        style={{ backgroundColor: ok ? '#F08A8A' : '#E5E7EB' }}
      >
        {ok ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FAF4E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
      <h1
        className="font-serif text-3xl font-bold"
        style={{ color: '#1B1411', fontVariationSettings: '"opsz" 144' }}
      >
        {title}
      </h1>
      <p className="text-base leading-relaxed" style={{ color: '#2A1F19' }}>
        {body}
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#F08A8A', color: '#FAF4E9' }}
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium" style={{ color: '#1B1411' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
        style={{
          backgroundColor: '#FFF',
          borderColor: '#E5DDD5',
          color: '#1B1411',
        }}
      />
    </div>
  );
}
