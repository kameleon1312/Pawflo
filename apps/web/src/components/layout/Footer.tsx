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
    <footer className="bg-ink text-bone">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-serif text-2xl font-bold text-cream mb-3">PawFlo</p>
            <p className="font-sans text-sm text-textFaint leading-relaxed">
              Pierwsza polska aplikacja łącząca właścicieli psów.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-textFaint mb-4">
                {category}
              </p>
              <ul className="space-y-3 list-none p-0 m-0">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="font-sans text-sm text-textLow hover:text-cream transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-inkSoft flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-textFaint">
            © {new Date().getFullYear()} PawFlo. Wszelkie prawa zastrzeżone.
          </p>
          <p className="font-sans text-xs text-textFaint">
            Zrobione z ♥ dla właścicieli psów w Polsce
          </p>
        </div>
      </div>
    </footer>
  );
}
