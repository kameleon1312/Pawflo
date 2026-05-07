const PLANS = [
  {
    name: 'Free',
    price: '0 zł',
    period: 'zawsze',
    features: ['10 swipe\'ów dziennie', 'Panel zdrowia (1 pies)', 'PawMap — przeglądanie'],
    cta: 'Zacznij za darmo',
    featured: false,
  },
  {
    name: 'Plus',
    price: '19 zł',
    period: 'miesięcznie',
    features: [
      'Nieograniczone swipe\'y',
      'Panel zdrowia (3 psy)',
      'PawMap — recenzje i filtry',
      'Priorytetowe dopasowania',
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
      'Eksport danych zdrowotnych (PDF)',
      'Przypomnienia o wizytach SMS',
      'Wsparcie priorytetowe',
    ],
    cta: 'Wybierz Pro',
    featured: false,
  },
] as const;

export function PricingSection() {
  return (
    <section className="bg-bone py-24 md:py-32" id="cennik" aria-labelledby="pricing-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="pricing-heading"
            className="font-serif font-bold text-ink text-4xl md:text-5xl text-balance mb-4"
          >
            Prosty cennik
          </h2>
          <p className="font-sans text-textMid text-lg">
            Zacznij za darmo. Rozszerz gdy chcesz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map(({ name, price, period, features, cta, featured }) => (
            <article
              key={name}
              className={`rounded-2xl p-8 flex flex-col gap-6 border ${
                featured
                  ? 'bg-ink border-coral shadow-xl scale-105'
                  : 'bg-cream border-warmLine'
              }`}
            >
              <div>
                <h3
                  className={`font-serif font-bold text-2xl mb-1 ${
                    featured ? 'text-cream' : 'text-ink'
                  }`}
                >
                  {name}
                </h3>
                <p className={`font-sans ${featured ? 'text-textFaint' : 'text-textLow'} text-sm`}>
                  {period}
                </p>
              </div>

              <p className={`font-serif font-bold text-5xl ${featured ? 'text-coral' : 'text-ink'}`}>
                {price}
              </p>

              <ul className="flex flex-col gap-3 flex-1">
                {features.map((f) => (
                  <li
                    key={f}
                    className={`font-sans text-sm flex items-start gap-2 ${
                      featured ? 'text-bone' : 'text-textMid'
                    }`}
                  >
                    <span className="text-coral mt-0.5" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`inline-flex items-center justify-center font-sans font-semibold
                           text-sm px-6 py-3 rounded-full transition-opacity ${
                  featured
                    ? 'bg-coral-gradient text-cream hover:opacity-90'
                    : 'border border-warmLine text-ink hover:border-coral'
                }`}
              >
                {cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
