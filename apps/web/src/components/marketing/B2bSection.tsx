import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

const PARTNERS = [
  { icon: '🏥', label: 'Kliniki weterynaryjne' },
  { icon: '✂️', label: 'Groomery' },
  { icon: '🛍️', label: 'Sklepy zoologiczne' },
  { icon: '🌳', label: 'Hotele i pensjonaty' },
  { icon: '🎓', label: 'Szkoły dla psów' },
  { icon: '📸', label: 'Fotografowie' },
] as const;

export function B2bSection() {
  return (
    <section className="bg-inkSoft py-24 md:py-32" aria-labelledby="b2b-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <FadeIn direction="right">
            <div className="flex flex-col gap-6">
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-coralSoft">
                Dla firm i usługodawców
              </p>
              <h2
                id="b2b-heading"
                className="font-serif font-bold text-cream text-4xl md:text-5xl text-balance"
              >
                Dotrzyj do właścicieli psów w swojej okolicy
              </h2>
              <p className="font-sans text-bone text-lg leading-relaxed">
                Dodaj swoją firmę do PawMap i pojawiaj się tam, gdzie właściciele psów szukają usług.
                Bez prowizji, bez ukrytych opłat — tylko płaski abonament.
              </p>
              <ul className="flex flex-col gap-3">
                {['Profil firmy na PawMap', 'Recenzje i oceny od właścicieli', 'Powiadomienia push do lokalnych użytkowników', 'Dashboard ze statystykami'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-sans text-bone text-sm">
                    <span className="text-coral" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="#waitlist"
                  className="inline-flex items-center justify-center bg-coral-gradient text-cream
                             font-sans font-semibold text-sm px-7 py-3.5 rounded-full
                             hover:opacity-90 transition-opacity"
                >
                  Dołącz jako partner
                </Link>
                <Link
                  href="/dla-biznesu"
                  className="inline-flex items-center justify-center border border-white/20 text-bone
                             font-sans font-semibold text-sm px-7 py-3.5 rounded-full
                             hover:border-coralSoft hover:text-cream transition-colors"
                >
                  Dowiedz się więcej
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right — partner types grid */}
          <FadeIn direction="left" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PARTNERS.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/10
                             hover:border-coral/30 transition-colors text-center"
                >
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                  <p className="font-sans text-bone text-xs font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
