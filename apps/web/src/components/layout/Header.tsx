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
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        aria-label="Nawigacja główna"
      >
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-neu-hi"
          aria-label="PawFlo — strona główna"
        >
          PawFlo
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-3 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex items-center font-sans text-sm text-neu-mid px-4 py-2.5 rounded-full
                           transition-shadow hover:text-neu-hi hover:shadow-neu-inset-sm"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Wrapper hides it: component classes would otherwise override `hidden` */}
          <div className="hidden md:block">
            <Link href="#waitlist" className="neu-btn-primary text-sm px-6 py-3">
              Pobierz aplikację
            </Link>
          </div>

          {/* Hamburger */}
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
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-neu ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col px-4 py-4 gap-2 list-none m-0">
          {NAV_LINKS.map(({ href, label }) => (
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
          <li className="pt-2">
            <Link
              href="#waitlist"
              className="neu-btn-primary w-full text-sm px-6 py-3.5"
              onClick={() => setMenuOpen(false)}
            >
              Pobierz aplikację
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
