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
    <section className="bg-neu py-24 md:py-32" aria-labelledby="b2b-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <FadeIn direction="right">
            <div className="flex flex-col gap-6">
              <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-neu-accent">
                Dla firm i usługodawców
              </p>
              <h2
                id="b2b-heading"
                className="font-serif font-bold text-neu-hi text-4xl md:text-5xl text-balance"
              >
                Dotrzyj do właścicieli psów w swojej okolicy
              </h2>
              <p className="font-sans text-neu-mid text-lg leading-relaxed">
                Dodaj swoją firmę do mapy PawFlo i pojawiaj się tam, gdzie właściciele psów szukają usług.
                Bez prowizji, bez ukrytych opłat — tylko płaski abonament.
              </p>
              <ul className="flex flex-col gap-3">
                {['Profil firmy na mapie PawFlo', 'Recenzje i oceny od właścicieli', 'Powiadomienia push do lokalnych użytkowników', 'Dashboard ze statystykami'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-sans text-neu-mid text-sm">
                    <span className="text-neu-accent" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="#waitlist"
                  className="neu-btn-primary text-sm px-7 py-3.5"
                >
                  Dołącz jako partner
                </Link>
                <Link
                  href="/dla-biznesu"
                  className="neu-btn text-sm px-7 py-3.5"
                >
                  Dowiedz się więcej
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right — partner types grid */}
          <FadeIn direction="left" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {PARTNERS.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl shadow-neu-raised-sm text-center"
                >
                  <span className="w-12 h-12 rounded-full shadow-neu-inset-sm flex items-center justify-center text-2xl" aria-hidden="true">{icon}</span>
                  <p className="font-sans text-neu-mid text-xs font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
