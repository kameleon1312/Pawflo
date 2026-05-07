'use client';

import { useState } from 'react';
import { WaitlistSchema } from '@pawflo/validation';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const parsed = WaitlistSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus('error');
      setErrorMsg('Podaj prawidłowy adres e-mail.');
      return;
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Coś poszło nie tak. Spróbuj ponownie.');
    }
  }

  return (
    <section
      id="waitlist"
      className="bg-ink py-24 md:py-32"
      aria-labelledby="waitlist-heading"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="waitlist-heading"
          className="font-serif font-bold text-cream text-4xl md:text-5xl text-balance mb-4"
        >
          Bądź pierwszy
        </h2>
        <p className="font-sans text-bone text-lg mb-10">
          Aplikacja w przygotowaniu. Zostaw e-mail — powiadomimy Cię przy starcie.
        </p>

        {status === 'success' ? (
          <p className="font-sans text-coral text-lg font-semibold">
            Jesteś na liście! Do zobaczenia przy starcie 🐾
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="waitlist-email" className="sr-only">
              Adres e-mail
            </label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              required
              className="flex-1 bg-inkSoft border border-warmLine text-cream placeholder:text-textFaint
                         font-sans text-base px-5 py-3.5 rounded-full focus:outline-none
                         focus:border-coral transition-colors"
              aria-describedby={errorMsg ? 'waitlist-error' : undefined}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-coral-gradient text-cream font-sans font-semibold text-sm
                         px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity
                         disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Wysyłam...' : 'Dołącz'}
            </button>
          </form>
        )}

        {errorMsg && (
          <p id="waitlist-error" role="alert" className="font-sans text-danger text-sm mt-3">
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  );
}
