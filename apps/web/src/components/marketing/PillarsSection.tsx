const PILLARS = [
  {
    name: 'MachDog',
    tagline: 'Tinder dla psów',
    description:
      'Swipe, dopasuj i umów spotkanie. Filtruj po rasie, rozmiarze i charakterze. Czat po matchingu.',
    color: 'text-coral',
    bg: 'bg-coralMist',
  },
  {
    name: 'PawPanel',
    tagline: 'Cyfrowy panel zdrowia',
    description:
      'Szczepienia, wizyty weterynaryjne, waga, leki i alergie — cała historia zdrowia w jednym miejscu.',
    color: 'text-success',
    bg: 'bg-bone',
  },
  {
    name: 'PawMap',
    tagline: 'Mapa usług dla psów',
    description:
      'Weterynarze, groomery, sklepy zoologiczne, parki dla psów — znajdź najlepsze miejsca w okolicy.',
    color: 'text-info',
    bg: 'bg-bone',
  },
] as const;

export function PillarsSection() {
  return (
    <section className="bg-bone py-24 md:py-32" aria-labelledby="pillars-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="pillars-heading"
            className="font-serif font-bold text-ink text-4xl md:text-5xl text-balance mb-4"
          >
            Trzy produkty. Jeden ekosystem.
          </h2>
          <p className="font-sans text-textMid text-lg max-w-2xl mx-auto">
            PawFlow to jedyna aplikacja, która łączy życie towarzyskie, zdrowie i usługi dla Twojego psa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map(({ name, tagline, description, color, bg }) => (
            <article key={name} className={`${bg} rounded-2xl p-8 border border-warmLine`}>
              <p className={`font-sans text-xs font-semibold tracking-widest uppercase ${color} mb-3`}>
                {tagline}
              </p>
              <h3 className="font-serif font-bold text-ink text-3xl mb-4">{name}</h3>
              <p className="font-sans text-textMid text-base leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
