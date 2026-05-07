import Link from 'next/link';

const NAV_LINKS = [
  { href: '/funkcje', label: 'Funkcje' },
  { href: '/cennik', label: 'Cennik' },
  { href: '/dla-biznesu', label: 'Dla biznesu' },
  { href: '/przewodnik', label: 'Przewodnik' },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bone/80 backdrop-blur-md border-b border-warmLine">
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Nawigacja główna"
      >
        <Link
          href="/"
          className="font-serif text-xl font-bold text-ink tracking-tight"
          aria-label="PawFlo — strona główna"
        >
          PawFlo
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-sans text-sm text-textMid hover:text-ink transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#waitlist"
          className="bg-coral-gradient text-cream font-sans font-semibold text-sm
                     px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          Pobierz aplikację
        </Link>
      </nav>
    </header>
  );
}
