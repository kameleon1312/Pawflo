import { FadeIn } from '@/components/ui/FadeIn';

const CARDS = [
  {
    tag: 'Poradniki',
    title: 'Wiedza, której nie znajdziesz w pięć minut',
    description:
      'Co zrobić po ukąszeniu kleszcza, jak podróżować z psem pociągiem, jak czytać skład karmy. Krótkie, praktyczne poradniki z datą weryfikacji i źródłami.',
    points: ['Pisane przez redakcję PawFlo', 'Zapisuj ulubione na później', 'Dostępne także offline'],
  },
  {
    tag: 'Społeczność',
    title: 'Opiekunowie, którzy dzielą się tym, co sprawdzone',
    description:
      'Kanały tematyczne o zdrowiu, tresurze, rasach i spacerach. Zadaj pytanie, podziel się doświadczeniem i korzystaj z cudzych.',
    points: ['Kanały tematyczne', 'Moderacja i jasny regulamin', 'Twoje dane zostają prywatne'],
  },
] as const;

export function CommunitySection() {
  return (
    <section className="bg-neu py-24 md:py-32" aria-labelledby="community-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="community-heading"
            className="font-serif font-bold text-neu-hi text-4xl md:text-5xl text-balance mb-4"
          >
            Nie jesteś z tym sam
          </h2>
          <p className="font-sans text-neu-mid text-lg max-w-2xl mx-auto">
            Opieka nad psem to codzienne decyzje. Pomagamy je podejmować z wiedzą i w dobrym towarzystwie.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {CARDS.map(({ tag, title, description, points }, i) => (
            <FadeIn key={tag} delay={i * 0.15}>
              <article className="bg-neu shadow-neu-raised rounded-3xl p-8 flex flex-col gap-5 h-full">
                <p className="font-sans text-xs font-semibold tracking-widest uppercase text-neu-accent">
                  {tag}
                </p>
                <h3 className="font-serif font-bold text-neu-hi text-2xl text-balance">{title}</h3>
                <p className="font-sans text-neu-mid text-base leading-relaxed">{description}</p>
                <ul className="flex flex-col gap-2 mt-auto">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 font-sans text-sm text-neu-mid">
                      <span className="text-neu-accent mt-0.5" aria-hidden="true">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
