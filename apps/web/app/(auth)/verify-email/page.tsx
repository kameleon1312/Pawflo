import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Weryfikacja e-mail',
  robots: { index: false, follow: false },
};

async function verifyToken(token: string): Promise<boolean> {
  try {
    const apiUrl = process.env['API_URL'] ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <Result
        success={false}
        message="Brak tokenu weryfikacyjnego. Sprawdź link z e-maila."
      />
    );
  }

  const success = await verifyToken(token);

  return (
    <Result
      success={success}
      message={
        success
          ? 'Adres e-mail został potwierdzony! Możesz teraz zalogować się do aplikacji PawFlo.'
          : 'Link weryfikacyjny wygasł lub jest nieprawidłowy. Zaloguj się w aplikacji i poproś o nowy link.'
      }
    />
  );
}

function Result({ success, message }: { success: boolean; message: string }) {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF4E9' }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: success ? '#F08A8A' : '#E5E7EB' }}
        >
          {success ? (
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
          {success ? 'E-mail potwierdzony!' : 'Ups, coś poszło nie tak'}
        </h1>

        <p className="text-base leading-relaxed" style={{ color: '#2A1F19' }}>
          {message}
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#F08A8A', color: '#FAF4E9' }}
        >
          Wróć do strony głównej
        </Link>
      </div>
    </main>
  );
}
