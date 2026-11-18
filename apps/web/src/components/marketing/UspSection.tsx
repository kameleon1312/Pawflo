import { FadeIn } from '@/components/ui/FadeIn';

const USPS = [
  {
    icon: '🐾',
    title: 'Tylko o psach',
    description: 'Zero kotów, chomików i innych. Wszystko zbudowane wokół jednej pasji i jednego pupila.',
  },
  {
    icon: '🔒',
    title: 'Prywatne z założenia',
    description: 'Pamiętnik i notatki medyczne są szyfrowane. Zgodność z RODO, żadnych reklam opartych na Twoich danych.',
  },
  {
    icon: '📖',
    title: 'Nic nie ginie',
    description: 'Wspomnienia, wyniki badań i postępy w jednym miejscu, a nie w galerii telefonu i szufladzie.',
  },
  {
    icon: '❤️',
    title: 'Zdrowie pod kontrolą',
    description: 'Szczepienia, wizyty, waga. Nigdy więcej zgubionej kartki od weterynarza.',
  },
  {
    icon: '🧭',
    title: 'Wiedza bez szukania',
    description: 'Poradniki o rzeczach, które trudno znaleźć, napisane i sprawdzone przez redakcję PawFlo.',
  },
  {
    icon: '🇵🇱',
    title: 'Polska, od podstaw',
    description: 'Dla polskich opiekunów psów: polski język, polskie realia, polska społeczność.',
  },
] as const;

export function UspSection() {
  return (
    <section className="bg-neu py-24 md:py-32" aria-labelledby="usp-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="usp-heading"
            className="font-serif font-bold text-neu-hi text-4xl md:text-5xl text-balance mb-4"
          >
            Dlaczego PawFlo?
          </h2>
          <p className="font-sans text-neu-mid text-lg max-w-xl mx-auto">
            Nie kolejna aplikacja dla zwierząt. Pierwsza, która naprawdę rozumie właścicieli psów.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {USPS.map(({ icon, title, description }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="flex flex-col gap-4 p-7 rounded-3xl shadow-neu-raised h-full">
                <span className="w-14 h-14 rounded-2xl shadow-neu-inset flex items-center justify-center text-2xl" aria-hidden="true">{icon}</span>
                <h3 className="font-serif font-bold text-neu-hi text-xl">{title}</h3>
                <p className="font-sans text-neu-mid text-sm leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
