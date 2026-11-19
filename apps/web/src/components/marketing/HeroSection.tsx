import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

/**
 * One solid paw silhouette: a wide pad with four toes overlapping its top edge, so the
 * union is a single connected shape (no gaps between toes and pad).
 * Why a 4:3 box drawn in a 1.333 x 1 space and scaled by 0.75 on x: the photo is 4:3, so the
 * whole photo fits uncropped, and shapes keep their real proportions (no stretched ellipses).
 * Every shape must stay inside the box: the painted layers are the box itself, so anything outside is cut flat.
 */
function PawClip() {
  const squeeze = 'scale(0.75 1)';
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="paw-clip" clipPathUnits="objectBoundingBox">
          <rect x="0" y="0.4" width="1.333" height="0.6" rx="0.26" ry="0.26" transform={squeeze} />
          <ellipse cx="0.17" cy="0.4" rx="0.12" ry="0.17" transform={`${squeeze} rotate(-25 0.17 0.4)`} />
          <ellipse cx="0.5" cy="0.24" rx="0.16" ry="0.21" transform={`${squeeze} rotate(-8 0.5 0.24)`} />
          <ellipse cx="0.84" cy="0.24" rx="0.17" ry="0.21" transform={`${squeeze} rotate(8 0.84 0.24)`} />
          <ellipse cx="1.163" cy="0.4" rx="0.12" ry="0.17" transform={`${squeeze} rotate(25 1.163 0.4)`} />
        </clipPath>
      </defs>
    </svg>
  );
}

// Mosaic layout on an 8 x 6 grid: [col, row, colSpan, rowSpan]. Mixed sizes read as a hand-laid mosaic.
const COLS = 8;
const ROWS = 6;
const BIG_TILES: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 0, 2, 2],
  [5, 0, 2, 2],
  [3, 2, 2, 2],
  [6, 3, 2, 2],
  [0, 4, 2, 2],
  [4, 4, 2, 1],
];

function buildTiles() {
  const taken = new Set<string>();
  const tiles: Array<{ col: number; row: number; cs: number; rs: number }> = [];
  for (const [col, row, cs, rs] of BIG_TILES) {
    tiles.push({ col, row, cs, rs });
    for (let c = col; c < col + cs; c++) for (let r = row; r < row + rs; r++) taken.add(`${c},${r}`);
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!taken.has(`${c},${r}`)) tiles.push({ col: c, row: r, cs: 1, rs: 1 });
    }
  }
  return tiles;
}

const TILES = buildTiles();
// Served through the Next image optimizer (1920 is a default device size) instead of the 5184px original
const MOSAIC_SRC = '/_next/image?url=%2Fhero-dog.jpg&w=1920&q=80';

function PawMosaic() {
  return (
    <div
      className="absolute inset-0 grid gap-[5px]"
      style={{
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {TILES.map(({ col, row, cs, rs }) => (
        <div
          key={`${col}-${row}`}
          className="rounded-md sm:rounded-xl"
          style={{
            gridColumn: `${col + 1} / span ${cs}`,
            gridRow: `${row + 1} / span ${rs}`,
            backgroundImage: `url(${MOSAIC_SRC})`,
            // Each tile shows its own slice of the one photo, so together they reassemble it
            backgroundSize: `${(COLS / cs) * 100}% ${(ROWS / rs) * 100}%`,
            backgroundPosition: `${COLS - cs === 0 ? 0 : (col / (COLS - cs)) * 100}% ${
              ROWS - rs === 0 ? 0 : (row / (ROWS - rs)) * 100
            }%`,
          }}
        />
      ))}
    </div>
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
              className="relative mx-auto w-full lg:w-[min(75vw,1040px)] aspect-[4/3]"
              style={{
                filter:
                  'drop-shadow(14px 14px 22px var(--neu-lo)) drop-shadow(-14px -14px 22px var(--neu-hi))',
              }}
              role="img"
              aria-label="Opiekunka siedząca z psem na skale nad morzem o zachodzie słońca, zdjęcie ułożone w mozaikę w kształcie łapy"
            >
              <div className="absolute inset-0 bg-neu" style={{ clipPath: 'url(#paw-clip)' }} />
              <div className="absolute inset-[2.5%]" style={{ clipPath: 'url(#paw-clip)' }}>
                <PawMosaic />
              </div>
            </div>
          </FadeIn>

          {/* Headline cradled on both sides of the paw (desktop); stacked below on mobile */}
          <div
            className="hidden lg:block absolute left-0 top-[3%] w-[26%]"
            aria-hidden="true"
          >
            <FadeIn delay={0.3} direction="right">
              <p className={HEADLINE_CLASS}>Wszystko,<br />co ważne</p>
            </FadeIn>
          </div>
          <div
            className="hidden lg:block absolute right-0 top-[3%] w-[26%] text-right"
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
