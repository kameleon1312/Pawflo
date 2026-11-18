import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

/**
 * Paw silhouette used as a clip path. Why a 1.2 x 1 coordinate space with a scale():
 * objectBoundingBox units stretch to the element's box, so shapes are drawn at the
 * real 6:5 aspect ratio and squeezed back to 0..1 to keep the ellipses undistorted.
 */
function PawClip() {
  // Pad and toes are separate clip paths so each can show its own crop of the photo
  const toes = (
    <>
      <ellipse cx="0.13" cy="0.47" rx="0.1" ry="0.15" transform="scale(0.8333 1) rotate(-30 0.13 0.47)" />
      <ellipse cx="0.39" cy="0.22" rx="0.11" ry="0.17" transform="scale(0.8333 1) rotate(-10 0.39 0.22)" />
      <ellipse cx="0.81" cy="0.22" rx="0.11" ry="0.17" transform="scale(0.8333 1) rotate(10 0.81 0.22)" />
      <ellipse cx="1.07" cy="0.47" rx="0.1" ry="0.15" transform="scale(0.8333 1) rotate(30 1.07 0.47)" />
    </>
  );
  const pad = (
    <path
      transform="scale(0.8333 1)"
      d="M0.6 0.46 C0.84 0.46 0.98 0.64 0.98 0.78 C0.98 0.92 0.84 0.99 0.6 0.99 C0.36 0.99 0.22 0.92 0.22 0.78 C0.22 0.64 0.36 0.46 0.6 0.46 Z"
    />
  );
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="paw-clip" clipPathUnits="objectBoundingBox">
          {toes}
          {pad}
        </clipPath>
        <clipPath id="paw-toes-clip" clipPathUnits="objectBoundingBox">{toes}</clipPath>
        <clipPath id="paw-pad-clip" clipPathUnits="objectBoundingBox">{pad}</clipPath>
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
              <div className="absolute inset-[3%]">
                {/* Toes: scenery crop */}
                <div className="absolute inset-0" style={{ clipPath: 'url(#paw-toes-clip)' }}>
                  <Image
                    src="/hero-dog.jpg"
                    alt=""
                    fill
                    priority
                    quality={85}
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    style={{ objectFit: 'cover', objectPosition: '0% 0%', transform: 'scale(1.7)', transformOrigin: '0% 0%' }}
                  />
                </div>

                {/*
                  Pad: the owner and dog must fit inside the oval uncropped, which a full-bleed
                  photo cannot do (its bottom edge would have to sit below the pad). So a blurred
                  copy fills the pad and the sharp photo is placed at a smaller scale on top
                  with feathered edges. Numbers come from fitting the subject bbox into the pad ellipse.
                */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'url(#paw-pad-clip)' }}>
                  <Image
                    src="/hero-dog.jpg"
                    alt=""
                    fill
                    quality={60}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    style={{ objectFit: 'cover', objectPosition: '100% 55%', filter: 'blur(16px)', transform: 'scale(1.2)' }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: '17%',
                      top: '33%',
                      width: '60%',
                      height: '54%',
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent, #000 4%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 4%, #000 90%, transparent)',
                      WebkitMaskComposite: 'source-in',
                      maskImage:
                        'linear-gradient(to right, transparent, #000 4%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 4%, #000 90%, transparent)',
                      maskComposite: 'intersect',
                    }}
                  >
                    <Image
                      src="/hero-dog.jpg"
                      alt="Opiekunka siedząca z psem na skale nad morzem o zachodzie słońca"
                      fill
                      priority
                      quality={85}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  {/* Warm-black base so the feathered photo edge never reads as a smudge */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 62%, rgba(27,20,17,0.9) 100%)' }}
                  />
                </div>
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
