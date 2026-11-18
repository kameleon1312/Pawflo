import { FadeIn } from '@/components/ui/FadeIn';

const PLANS = [
  {
    name: 'Free',
    price: '0 zł',
    period: 'zawsze',
    features: ['Panel pupila (1 pies)', 'Pamiętnik i dzienniczek', '1 album z własną okładką', 'Mapa spacerów'],
    cta: 'Zacznij za darmo',
    featured: false,
  },
  {
    name: 'Plus',
    price: '19 zł',
    period: 'miesięcznie',
    features: [
      'Panel pupila (3 psy)',
      'Nieograniczone albumy i okładki',
      'Zdjęcia w pamiętniku bez limitu',
      'Zapisane poradniki offline',
    ],
    cta: 'Wybierz Plus',
    featured: true,
  },
  {
    name: 'Pro',
    price: '39 zł',
    period: 'miesięcznie',
    features: [
      'Wszystko z Plus',
      'Nieograniczona liczba psów',
      'Karta pupila do PDF dla weterynarza',
      'Przypomnienia o wizytach SMS',
      'Wsparcie priorytetowe',
    ],
    cta: 'Wybierz Pro',
    featured: false,
  },
] as const;

export function PricingSection() {
  return (
    <section id="cennik" className="bg-neu py-24 md:py-32" aria-labelledby="pricing-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="pricing-heading"
            className="font-serif font-bold text-neu-hi text-4xl md:text-5xl text-balance mb-4"
          >
            Prosty cennik
          </h2>
          <p className="font-sans text-neu-mid text-lg">
            Zacznij za darmo. Rozszerz gdy chcesz.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {PLANS.map(({ name, price, period, features, cta, featured }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <article
                className={`rounded-3xl p-8 flex flex-col gap-6 h-full bg-neu ${
                  featured ? 'shadow-neu-raised-lg md:scale-105' : 'shadow-neu-raised'
                }`}
              >
                <div>
                  <h3
                    className="font-serif font-bold text-2xl mb-1 text-neu-hi"
                  >
                    {name}
                  </h3>
                  <p className="font-sans text-neu-low text-sm">
                    {period}
                  </p>
                </div>

                <p className="font-serif font-bold text-5xl text-neu-hi">
                  {price}
                </p>

                <ul className="flex flex-col gap-3 flex-1">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="font-sans text-sm flex items-start gap-2 text-neu-mid"
                    >
                      <span className="text-neu-accent mt-0.5" aria-hidden="true">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#waitlist"
                  className={`${featured ? 'neu-btn-primary' : 'neu-btn'} text-sm px-6 py-3.5`}
                >
                  {cta}
                </a>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
