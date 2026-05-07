const STEPS = [
  {
    step: '01',
    title: 'Utwórz profil psa',
    description: 'Dodaj zdjęcia, opis charakteru i preferencje. Zajmuje to 3 minuty.',
  },
  {
    step: '02',
    title: 'Swipe i dopasuj',
    description: 'Przeglądaj psy z okolicy, swipuj i czekaj na match — dokładnie jak Tinder.',
  },
  {
    step: '03',
    title: 'Spotkaj się i buduj relację',
    description: 'Ustal termin spotkania przez czat i ciesz się, gdy psy się polubią.',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-cream py-24 md:py-32" aria-labelledby="how-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="how-heading"
            className="font-serif font-bold text-ink text-4xl md:text-5xl text-balance"
          >
            Jak to działa?
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-12" role="list">
          {STEPS.map(({ step, title, description }) => (
            <li key={step} className="flex flex-col gap-4">
              <span className="font-serif font-bold text-coralSoft text-6xl leading-none" aria-hidden="true">
                {step}
              </span>
              <h3 className="font-serif font-bold text-ink text-2xl">{title}</h3>
              <p className="font-sans text-textMid text-base leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
