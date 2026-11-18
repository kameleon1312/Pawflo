import Link from 'next/link';

const FOOTER_LINKS = {
  Produkt: [
    { href: '/funkcje', label: 'Funkcje' },
    { href: '/cennik', label: 'Cennik' },
    { href: '/dla-biznesu', label: 'Dla biznesu' },
  ],
  Wsparcie: [
    { href: '/przewodnik', label: 'Przewodnik' },
    { href: '/blog', label: 'Blog' },
  ],
  Prawo: [
    { href: '/regulamin', label: 'Regulamin' },
    { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
    { href: '/rodo', label: 'RODO' },
  ],
} as const;

export function Footer() {
  return (
    <footer className="bg-neu text-neu-mid px-4 sm:px-6 lg:px-8 pt-8 pb-10">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 rounded-[2.5rem] shadow-neu-inset">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-serif text-2xl font-bold text-neu-hi mb-3">PawFlo</p>
            <p className="font-sans text-sm text-neu-low leading-relaxed">
              Cyfrowy dom Twojego psa: wiedza, wspomnienia i spacery w jednym miejscu.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-neu-low mb-4">
                {category}
              </p>
              <ul className="space-y-3 list-none p-0 m-0">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="font-sans text-sm text-neu-mid hover:text-neu-hi transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 h-1.5 rounded-full shadow-neu-inset-sm" aria-hidden="true" />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-neu-low">
            © {new Date().getFullYear()} PawFlo. Wszelkie prawa zastrzeżone.
          </p>
          <p className="font-sans text-xs text-neu-low">
            Zrobione z ♥ dla właścicieli psów w Polsce
          </p>
        </div>
      </div>
    </footer>
  );
}
