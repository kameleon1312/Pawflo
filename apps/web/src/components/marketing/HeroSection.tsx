import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

/**
 * Paw silhouette used as a clip path. Why a 1.2 x 1 coordinate space with a scale():
 * objectBoundingBox units stretch to the element's box, so shapes are drawn at the
 * real 6:5 aspect ratio and squeezed back to 0..1 to keep the ellipses undistorted.
 */
function PawClip() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="paw-clip" clipPathUnits="objectBoundingBox">
          {/* clipPath only allows shapes (no <g>), so the scale is applied per shape */}
          <ellipse cx="0.13" cy="0.47" rx="0.1" ry="0.15" transform="scale(0.8333 1) rotate(-30 0.13 0.47)" />
          <ellipse cx="0.39" cy="0.22" rx="0.11" ry="0.17" transform="scale(0.8333 1) rotate(-10 0.39 0.22)" />
          <ellipse cx="0.81" cy="0.22" rx="0.11" ry="0.17" transform="scale(0.8333 1) rotate(10 0.81 0.22)" />
          <ellipse cx="1.07" cy="0.47" rx="0.1" ry="0.15" transform="scale(0.8333 1) rotate(30 1.07 0.47)" />
          <path
            transform="scale(0.8333 1)"
            d="M0.6 0.46 C0.84 0.46 0.98 0.64 0.98 0.78 C0.98 0.92 0.84 0.99 0.6 0.99 C0.36 0.99 0.22 0.92 0.22 0.78 C0.22 0.64 0.36 0.46 0.6 0.46 Z"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

const HEADLINE_CLASS =
  'font-serif font-bold text-neu-hi text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.05]';

export function HeroSection() {
  return (
    <section className="bg-neu overflow-hidden" aria-labelledby="hero-heading">
      <PawClip />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-20 md:pb-28">
        {/* One h1 for assistive tech; the visual split below is decorative */}
        <h1 id="hero-heading" className="sr-only">
          Wszystko, co ważne o Twoim psie
        </h1>

        <div className="relative">
          {/* Paw frame: drop-shadow (not box-shadow) so the shadows follow the clipped silhouette */}
          <FadeIn delay={0.1}>
            <div
              className="relative mx-auto w-full lg:w-[min(75vw,1040px)] aspect-[6/5]"
              style={{
                filter:
                  'drop-shadow(14px 14px 22px var(--neu-lo)) drop-shadow(-14px -14px 22px var(--neu-hi))',
              }}
            >
              <div className="absolute inset-0 bg-neu" style={{ clipPath: 'url(#paw-clip)' }} />
              <div className="absolute inset-[3%]" style={{ clipPath: 'url(#paw-clip)' }}>
                <Image
                  src="/hero-dog.jpg"
                  alt="Opiekunka siedząca z psem na skale nad morzem o zachodzie słońca"
                  fill
                  priority
                  quality={85}
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  style={{ objectFit: 'cover', objectPosition: '58% 40%' }}
                />
              </div>
            </div>
          </FadeIn>

          {/* Headline cradled on both sides of the paw (desktop); stacked below on mobile */}
          <div
            className="hidden lg:block absolute left-0 bottom-[6%] w-[26%]"
            aria-hidden="true"
          >
            <FadeIn delay={0.3} direction="right">
              <p className={HEADLINE_CLASS}>Wszystko,<br />co ważne</p>
            </FadeIn>
          </div>
          <div
            className="hidden lg:block absolute right-0 bottom-[6%] w-[26%] text-right"
            aria-hidden="true"
          >
            <FadeIn delay={0.4} direction="left">
              <p className={HEADLINE_CLASS}>o Twoim<br />psie</p>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.3} className="lg:hidden mt-10">
          <p className={`${HEADLINE_CLASS} text-center`} aria-hidden="true">
            Wszystko, co ważne o&nbsp;Twoim&nbsp;psie
          </p>
        </FadeIn>

        <div className="mt-10 lg:mt-6 flex flex-col items-center text-center">
          <FadeIn delay={0.45}>
            <p className="font-sans text-lg md:text-xl text-neu-mid max-w-xl leading-relaxed mb-10">
              Zdrowie, pamiętnik, album, ulubione spacery i poradniki.
              Cała jego historia i cała wiedza w jednej aplikacji.
            </p>
          </FadeIn>
          <FadeIn delay={0.55}>
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
      </div>
    </section>
  );
}
