import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

export function HeroSection() {
  return (
    <section className="bg-neu overflow-hidden" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <FadeIn delay={0.05}>
            <p className="inline-block font-sans text-xs font-semibold tracking-[0.18em] uppercase text-neu-accent
                          px-5 py-2.5 rounded-full shadow-neu-inset-sm mb-8">
              Wirtualny świat Twojego psa
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h1
              id="hero-heading"
              className="font-serif font-bold text-neu-hi text-5xl md:text-6xl lg:text-7xl text-balance mb-8 leading-[1.05]"
            >
              Wszystko, co ważne o&nbsp;Twoim&nbsp;psie
            </h1>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="font-sans text-lg md:text-xl text-neu-mid max-w-xl leading-relaxed mb-12">
              Zdrowie, pamiętnik, album, ulubione spacery i poradniki.
              Cała jego historia i cała wiedza w jednej aplikacji.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="#waitlist" className="neu-btn-primary text-base px-9 py-4">
                Zacznij za darmo
              </Link>
              <Link href="#funkcje" className="neu-btn text-base px-9 py-4">
                Zobacz funkcje
              </Link>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} direction="left">
          {/* Photo sits in a raised frame with an inset mat, like a physical picture frame */}
          <div className="rounded-[2.5rem] bg-neu p-4 shadow-neu-raised-lg">
            <div className="rounded-[2rem] p-3 shadow-neu-inset">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                <Image
                  src="/hero-dog.jpg"
                  alt="Opiekunka siedząca z psem na skale nad morzem o zachodzie słońca"
                  fill
                  priority
                  quality={85}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
