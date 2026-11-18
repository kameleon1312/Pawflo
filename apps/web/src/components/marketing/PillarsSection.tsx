import { FadeIn } from '@/components/ui/FadeIn';

const PILLARS = [
  {
    name: 'Panel pupila',
    tagline: 'Kompendium wiedzy',
    description:
      'Szczepienia, badania, leki, wizyty, waga, tresura i aktywności. Cała historia pupila w jednym miejscu, zawsze pod ręką u weterynarza.',
    color: 'text-success',
    bg: 'bg-bone',
  },
  {
    name: 'Pamiętnik',
    tagline: 'Jego opowieść',
    description:
      'Pierwszy dzień w domu, pierwsze morze, urodziny. Zapisuj chwile razem ze zdjęciami i wracaj do nich za rok, za pięć lat.',
    color: 'text-coral',
    bg: 'bg-coralMist',
  },
  {
    name: 'Album',
    tagline: 'Wspomnienia z okładką',
    description:
      'Wirtualne albumy tematyczne z własnymi okładkami. Wybierz zdjęcie, tytuł i kolor, a Twój pupil dostanie swoją książkę życia.',
    color: 'text-coral',
    bg: 'bg-bone',
  },
  {
    name: 'Dzienniczek',
    tagline: 'Postępy i uwagi',
    description:
      'Dziś zostało samo 30 minut. Kuleje na lewą łapę. Nowa karma bez reakcji. Szybkie notatki, które potem naprawdę się przydają.',
    color: 'text-info',
    bg: 'bg-bone',
  },
  {
    name: 'Mapa spacerów',
    tagline: 'Ulubione spoty',
    description:
      'Zapisuj miejsca, w których Wasz pies jest najszczęśliwszy: las, woda, wybieg. Szukaj nowych i wracaj do sprawdzonych.',
    color: 'text-info',
    bg: 'bg-bone',
  },
  {
    name: 'Poradniki',
    tagline: 'Wiedza trudna do zdobycia',
    description:
      'Pierwsza pomoc, prawa w podróży, skład karmy, ubezpieczenia. Praktyczne, sprawdzone poradniki napisane przez nas, a nie losowe wyniki z wyszukiwarki.',
    color: 'text-success',
    bg: 'bg-bone',
  },
] as const;

export function PillarsSection() {
  return (
    <section id="funkcje" className="bg-bone py-24 md:py-32" aria-labelledby="pillars-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2
            id="pillars-heading"
            className="font-serif font-bold text-ink text-4xl md:text-5xl text-balance mb-4"
          >
            Cały świat Twojego psa w jednym miejscu
          </h2>
          <p className="font-sans text-textMid text-lg max-w-2xl mx-auto">
            Wiedza, wspomnienia i codzienne postępy. Nic nie ginie w galerii telefonu ani w szufladzie.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map(({ name, tagline, description, color, bg }, i) => (
            <FadeIn key={name} delay={i * 0.08}>
              <article className={`${bg} rounded-2xl p-8 border border-warmLine h-full`}>
                <p className={`font-sans text-xs font-semibold tracking-widest uppercase ${color} mb-3`}>
                  {tagline}
                </p>
                <h3 className="font-serif font-bold text-ink text-3xl mb-4">{name}</h3>
                <p className="font-sans text-textMid text-base leading-relaxed">{description}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
