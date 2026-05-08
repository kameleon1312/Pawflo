import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

export function HeroSection() {
  return (
    <section className="relative bg-ink min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20 bg-hero-glow" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <FadeIn delay={0.05}>
          <p className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-coralSoft mb-6">
            Miłość na czterech łapach
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="font-serif font-bold text-cream font-display text-5xl md:text-7xl lg:text-8xl
                         max-w-3xl text-balance mb-8">
            Znajdź soulmate'a dla&nbsp;swojego&nbsp;psa
          </h1>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="font-sans text-lg md:text-xl text-bone max-w-xl leading-relaxed mb-12">
            Dopasowania MachDog, panel zdrowia PawPanel i mapa usług PawMap.
            Wszystko czego potrzebujesz — w jednej aplikacji.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#waitlist"
              className="inline-flex items-center justify-center bg-coral-gradient text-cream
                         font-sans font-semibold text-base px-8 py-4 rounded-full
                         hover:opacity-90 transition-opacity shadow-lg"
            >
              Zacznij za darmo
            </Link>
            <Link
              href="#funkcje"
              className="inline-flex items-center justify-center border border-warmLine text-bone
                         font-sans font-semibold text-base px-8 py-4 rounded-full
                         hover:border-coralSoft hover:text-cream transition-colors"
            >
              Zobacz funkcje
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
