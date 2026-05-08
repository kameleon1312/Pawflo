import { FadeIn } from '@/components/ui/FadeIn';

const TESTIMONIALS = [
  {
    quote:
      'Mój golden retriever Burek znalazł przyjaciela na całe życie przez MachDog. Teraz spotykają się co weekend w parku. Polecam każdemu właścicielowi!',
    author: 'Marta K.',
    location: 'Warszawa',
    dog: 'właścicielka Burka, golden retriever 3 lata',
    initials: 'MK',
  },
  {
    quote:
      'PawPanel to game changer. Mam w jednym miejscu wszystkie szczepienia, wizyty i historię wagi. Weterynarz jest pod wrażeniem jak przychodzimy przygotowani.',
    author: 'Tomasz W.',
    location: 'Kraków',
    dog: 'właściciel Zuzy, beagle 5 lat',
    initials: 'TW',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="bg-cream py-24 md:py-32" aria-labelledby="testimonials-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="testimonials-heading"
            className="font-serif font-bold text-ink text-4xl md:text-5xl text-balance mb-4"
          >
            Co mówią właściciele?
          </h2>
          <p className="font-sans text-textMid text-lg">
            Dołącz do pierwszych użytkowników PawFlo.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map(({ quote, author, location, dog, initials }, i) => (
            <FadeIn key={author} delay={i * 0.15}>
              <figure className="bg-bone border border-warmLine rounded-2xl p-8 flex flex-col gap-6 h-full">
                {/* Quote mark */}
                <span className="font-serif text-5xl text-coral leading-none" aria-hidden="true">"</span>

                <blockquote className="font-sans text-textMid text-base leading-relaxed flex-1">
                  {quote}
                </blockquote>

                <figcaption className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-full bg-coral-gradient flex items-center justify-center
                               font-sans font-bold text-cream text-sm flex-shrink-0"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-ink text-sm">{author} · {location}</p>
                    <p className="font-sans text-textFaint text-xs mt-0.5">{dog}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
