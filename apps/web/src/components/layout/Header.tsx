'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/#funkcje', label: 'Funkcje' },
  { href: '/#cennik', label: 'Cennik' },
  { href: '/dla-biznesu', label: 'Dla biznesu' },
  { href: '/przewodnik', label: 'Przewodnik' },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-bone/90 backdrop-blur-md border-b border-warmLine'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Nawigacja główna"
      >
        <Link
          href="/"
          className={`font-serif text-xl font-bold tracking-tight transition-colors duration-300 ${
            scrolled || menuOpen ? 'text-ink' : 'text-cream'
          }`}
          aria-label="PawFlo — strona główna"
        >
          PawFlo
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-sans text-sm transition-colors duration-300 hover:text-coral ${
                  scrolled ? 'text-textMid' : 'text-bone'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="#waitlist"
            className="hidden md:inline-flex items-center justify-center bg-coral-gradient
                       text-cream font-sans font-semibold text-sm px-5 py-2.5 rounded-full
                       hover:opacity-90 transition-opacity"
          >
            Pobierz aplikację
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 origin-center ${
                menuOpen
                  ? 'rotate-45 translate-y-2 bg-ink'
                  : scrolled ? 'bg-ink' : 'bg-cream'
              }`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${
                menuOpen ? 'opacity-0 bg-ink' : scrolled ? 'bg-ink' : 'bg-cream'
              }`}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 origin-center ${
                menuOpen
                  ? '-rotate-45 -translate-y-2 bg-ink'
                  : scrolled ? 'bg-ink' : 'bg-cream'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        } bg-bone/95 backdrop-blur-md border-t border-warmLine`}
      >
        <ul className="flex flex-col px-4 py-4 gap-1 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block font-sans text-base text-textMid hover:text-ink
                           py-3 px-2 rounded-lg hover:bg-warmLine/30 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="#waitlist"
              className="block text-center bg-coral-gradient text-cream font-sans
                         font-semibold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
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
