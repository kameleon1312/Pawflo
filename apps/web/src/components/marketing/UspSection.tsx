import { FadeIn } from '@/components/ui/FadeIn';

const USPS = [
  {
    icon: '🐾',
    title: 'Tylko dla właścicieli psów',
    description: 'Zero kotów, chomików i innych. Społeczność zbudowana wokół jednej pasji.',
  },
  {
    icon: '🔒',
    title: 'Twoje dane są bezpieczne',
    description: 'Szyfrowanie end-to-end, zgodność z RODO, żadnych reklam opartych na danych.',
  },
  {
    icon: '📍',
    title: 'Lokalnie — Twoja okolica',
    description: 'Dopasowania i usługi w promieniu który sam ustawiasz. Od sąsiedztwa do całego miasta.',
  },
  {
    icon: '❤️',
    title: 'Zdrowie pod kontrolą',
    description: 'Szczepienia, wizyty, waga — nigdy więcej zgubionej kartki od weterynarza.',
  },
  {
    icon: '⚡',
    title: 'Jedna aplikacja, trzy światy',
    description: 'MachDog, PawPanel i PawMap w jednym miejscu. Bez przeskakiwania między appkami.',
  },
  {
    icon: '🇵🇱',
    title: 'Polska — od podstaw',
    description: 'Zbudowane dla polskich właścicieli psów. Polski support, polskie usługi, polska społeczność.',
  },
] as const;

export function UspSection() {
  return (
    <section className="bg-ink py-24 md:py-32" aria-labelledby="usp-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="usp-heading"
            className="font-serif font-bold text-cream text-4xl md:text-5xl text-balance mb-4"
          >
            Dlaczego PawFlo?
          </h2>
          <p className="font-sans text-bone text-lg max-w-xl mx-auto">
            Nie kolejna aplikacja dla zwierząt. Pierwsza, która naprawdę rozumie właścicieli psów.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {USPS.map(({ icon, title, description }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10 hover:border-coral/30 transition-colors">
                <span className="text-3xl" aria-hidden="true">{icon}</span>
                <h3 className="font-serif font-bold text-cream text-xl">{title}</h3>
                <p className="font-sans text-textFaint text-sm leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
