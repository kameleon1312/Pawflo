import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

/**
 * Anatomically modelled dog paw, drawn in a 1.1 x 1 space and scaled by 1/1.1 on x
 * so ellipses keep their real proportions inside the objectBoundingBox clip.
 *
 * Real paw parts: a heart-shaped metacarpal pad with three lobes on its lower edge, two inner
 * toes pointing nearly straight up, two outer toes splayed ~38deg outward. The "web" ellipse
 * bridges toes and pad (fur between them in a real foot), which keeps the silhouette one solid
 * shape — required so the photo mosaic reads as a single object.
 * Every shape stays inside the box: the painted layers are the box, anything outside is cut flat.
 */
const SQUEEZE = 'scale(0.9091 1)';

const PAW_SHAPES = (
  <>
    {/* Toes */}
    <ellipse cx="0.40" cy="0.21" rx="0.125" ry="0.17" transform={`${SQUEEZE} rotate(-10 0.40 0.21)`} />
    <ellipse cx="0.70" cy="0.21" rx="0.125" ry="0.17" transform={`${SQUEEZE} rotate(10 0.70 0.21)`} />
    <ellipse cx="0.13" cy="0.46" rx="0.105" ry="0.15" transform={`${SQUEEZE} rotate(-38 0.13 0.46)`} />
    <ellipse cx="0.97" cy="0.46" rx="0.105" ry="0.15" transform={`${SQUEEZE} rotate(38 0.97 0.46)`} />
    {/* Web between toes and pad */}
    <ellipse cx="0.55" cy="0.53" rx="0.36" ry="0.1" transform={SQUEEZE} />
    {/* Metacarpal pad: flat-ish top, three lobes along the bottom */}
    <path
      transform={SQUEEZE}
      d="M0.55 0.53 C0.683 0.51 0.836 0.58 0.88 0.70 C0.924 0.82 0.88 0.94 0.77 0.97 C0.682 0.99 0.616 0.96 0.55 0.96 C0.484 0.96 0.418 0.99 0.33 0.97 C0.22 0.94 0.176 0.82 0.22 0.70 C0.264 0.58 0.417 0.51 0.55 0.53 Z"
    />
  </>
);

// Mosaic layout on a 10 x 10 grid: [col, row, colSpan, rowSpan]. Mixed sizes read as hand-laid tiles.
const GRID = 10;
const BIG_TILES: ReadonlyArray<readonly [number, number, number, number]> = [
  [3, 0, 2, 2],
  [0, 3, 2, 2],
  [5, 2, 2, 2],
  [8, 3, 2, 2],
  [2, 5, 2, 2],
  [6, 6, 2, 2],
  [4, 8, 2, 2],
];

const TILES = (() => {
  const taken = new Set<string>();
  const tiles: Array<{ col: number; row: number; cs: number; rs: number }> = [];
  for (const [col, row, cs, rs] of BIG_TILES) {
    tiles.push({ col, row, cs, rs });
    for (let c = col; c < col + cs; c++) for (let r = row; r < row + rs; r++) taken.add(`${c},${r}`);
  }
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (!taken.has(`${c},${r}`)) tiles.push({ col: c, row: r, cs: 1, rs: 1 });
    }
  }
  return tiles;
})();

const CELL = 1 / GRID;
const GAP = 0.007; // grout width in box units

function PawClips() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="paw-clip" clipPathUnits="objectBoundingBox">{PAW_SHAPES}</clipPath>
        {/* Rounded tiles; intersected with the paw clip because the two clips sit on nested elements */}
        <clipPath id="paw-tiles" clipPathUnits="objectBoundingBox">
          {TILES.map(({ col, row, cs, rs }) => (
            <rect
              key={`${col}-${row}`}
              x={col * CELL + GAP / 2}
              y={row * CELL + GAP / 2}
              width={cs * CELL - GAP}
              height={rs * CELL - GAP}
              rx={0.012}
              ry={0.012}
            />
          ))}
        </clipPath>
      </defs>
    </svg>
  );
}

const PHOTO = '/_next/image?url=%2Fhero-dog.jpg&w=1920&q=80';
const FEATHER =
  'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 7%, #000 100%)';

const HEADLINE_CLASS =
  'font-serif font-bold text-neu-hi text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.05]';

export function HeroSection() {
  return (
    <section className="bg-neu overflow-hidden" aria-labelledby="hero-heading">
      <PawClips />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-20 md:pb-28">
        {/* One h1 for assistive tech; the visual split below is decorative */}
        <h1 id="hero-heading" className="sr-only">
          Wszystko, co ważne o Twoim psie
        </h1>

        <div className="relative">
          {/* drop-shadow (not box-shadow) so the Soft UI shadows follow the clipped silhouette */}
          <FadeIn delay={0.1}>
            <div
              className="relative mx-auto w-full lg:w-[min(75vw,900px)] aspect-[1.1/1]"
              style={{
                filter:
                  'drop-shadow(14px 14px 22px var(--neu-lo)) drop-shadow(-14px -14px 22px var(--neu-hi))',
              }}
              role="img"
              aria-label="Opiekunka siedząca z psem na skale nad morzem o zachodzie słońca, zdjęcie ułożone w mozaikę w kształcie łapy"
            >
              <div className="absolute inset-0 bg-neu" style={{ clipPath: 'url(#paw-clip)' }} />

              <div className="absolute inset-[2.5%]" style={{ clipPath: 'url(#paw-clip)' }}>
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'url(#paw-tiles)' }}>
                  {/* Scenery for toes and web: top-left of the photo, enlarged (it is naturally out of focus) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${PHOTO})`,
                      backgroundSize: '300% auto',
                      backgroundPosition: '0% 0%',
                    }}
                  />
                  {/*
                    The whole photo, sized and placed so the owner, the dog and its tail fit inside the pad
                    (pad ~ x 20-80%, y 53-98% of the box). Feathered edge so it melts into the scenery.
                  */}
                  <div
                    className="absolute"
                    style={{
                      left: '22%',
                      top: '52%',
                      width: '56%',
                      height: '46.2%',
                      backgroundImage: `url(${PHOTO})`,
                      backgroundSize: '100% 100%',
                      WebkitMaskImage: FEATHER,
                      WebkitMaskComposite: 'source-in',
                      maskImage: FEATHER,
                      maskComposite: 'intersect',
                    }}
                  />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Headline cradled on both sides of the paw (desktop); stacked below on mobile */}
          <div className="hidden lg:block absolute left-0 top-[3%] w-[26%]" aria-hidden="true">
            <FadeIn delay={0.3} direction="right">
              <p className={HEADLINE_CLASS}>Wszystko,<br />co ważne</p>
            </FadeIn>
          </div>
          <div className="hidden lg:block absolute right-0 top-[3%] w-[26%] text-right" aria-hidden="true">
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
