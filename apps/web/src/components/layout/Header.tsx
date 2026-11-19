'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/ThemeShell';

const NAV_LINKS = [
  { href: '/#funkcje', label: 'Funkcje' },
  { href: '/#cennik', label: 'Cennik' },
  { href: '/dla-biznesu', label: 'Dla biznesu' },
  { href: '/przewodnik', label: 'Przewodnik' },
] as const;

// Pages do not exist on the web yet (sign-in lives in the mobile app); kept as constants so the targets change in one place
const LOGIN_HREF = '/logowanie';
const HELP_HREF = '/pomoc';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-neu shadow-neu-raised-sm">
      {/* Three equal columns keep the logo exactly centred regardless of what sits on either side */}
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-[1fr_auto_1fr] items-center"
        aria-label="Nawigacja główna"
      >
        {/* Left: menu (hamburger on mobile) */}
        <div className="flex items-center justify-start">
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex items-center font-sans text-sm text-neu-mid px-3 lg:px-4 py-2.5 rounded-full
                             transition-shadow hover:text-neu-hi hover:shadow-neu-inset-sm"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="md:hidden neu-btn w-11 h-11 flex-col gap-1.5"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-neu-hi transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-neu-hi transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-neu-hi transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Centre: logo */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-neu-hi justify-self-center"
          aria-label="PawFlo — strona główna"
        >
          PawFlo
        </Link>

        {/* Right: help, theme, sign in */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            href={HELP_HREF}
            className="hidden md:inline-flex items-center font-sans text-sm text-neu-mid px-4 py-2.5 rounded-full
                       transition-shadow hover:text-neu-hi hover:shadow-neu-inset-sm"
          >
            Pomoc
          </Link>
          {/* On narrow screens the toggle moves into the menu so the logo keeps its centre */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link href={LOGIN_HREF} className="neu-btn-primary whitespace-nowrap text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3">
            Zaloguj się
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-neu ${
          menuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col px-4 py-4 gap-2 list-none m-0">
          {[...NAV_LINKS, { href: HELP_HREF, label: 'Pomoc' }].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block font-sans text-base text-neu-mid py-3 px-5 rounded-2xl
                           hover:text-neu-hi hover:shadow-neu-inset-sm transition-shadow"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="sm:hidden pt-2 px-5 flex items-center gap-3 font-sans text-sm text-neu-mid">
            <ThemeToggle />
            Motyw jasny lub ciemny
          </li>
        </ul>
      </div>
    </header>
  );
}
