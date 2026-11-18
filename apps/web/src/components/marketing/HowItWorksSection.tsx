import { FadeIn } from '@/components/ui/FadeIn';

const STEPS = [
  {
    step: '01',
    title: 'Poznaj swojego pupila na nowo',
    description: 'Załóż profil psa: rasa, chip, zdjęcia i historia zdrowia. Zajmuje to kilka minut.',
  },
  {
    step: '02',
    title: 'Zapisuj, co ważne',
    description: 'Dodawaj wpisy do pamiętnika, notatki do dzienniczka, zdjęcia do albumu i spoty na mapę spacerów.',
  },
  {
    step: '03',
    title: 'Wracaj do wspomnień i wiedzy',
    description: 'Przeglądaj oś czasu, korzystaj z poradników i wymieniaj się doświadczeniami ze społecznością.',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-neu py-24 md:py-32" aria-labelledby="how-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="how-heading"
            className="font-serif font-bold text-neu-hi text-4xl md:text-5xl text-balance"
          >
            Jak to działa?
          </h2>
        </FadeIn>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-12" role="list">
          {STEPS.map(({ step, title, description }, i) => (
            <FadeIn key={step} delay={i * 0.12}>
              <li className="flex flex-col gap-4">
                <span className="w-20 h-20 rounded-full shadow-neu-inset flex items-center justify-center font-serif font-bold text-neu-accent text-3xl" aria-hidden="true">
                  {step}
                </span>
                <h3 className="font-serif font-bold text-neu-hi text-2xl">{title}</h3>
                <p className="font-sans text-neu-mid text-base leading-relaxed">{description}</p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
