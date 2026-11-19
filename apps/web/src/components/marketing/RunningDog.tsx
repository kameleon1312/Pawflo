/**
 * Hand-built running dog (side view, facing right) as layered SVG.
 *
 * Why one SVG with CSS animation instead of video/Lottie: zero extra bytes of dependencies,
 * crisp at any size, and every joint is its own group, so the gait stays physically plausible:
 *   - each leg = upper segment swinging at shoulder/hip + lower segment folding at elbow/hock
 *   - diagonal pairs run in anti-phase (gallop), far-side legs are darker to give depth
 *   - body bobs at twice the stride rate, head nods, ears lag behind (flap), tail wags fast
 * Pivot points are given in SVG user units in globals.css (.dog-* rules); keep them in sync
 * with the coordinates below.
 */

const FUR = 'url(#dog-fur)';
const FUR_FAR = '#8F4220';
const FUR_EAR = '#9C4A20';
const CREAM = '#F6E7D1';
const INK = '#1B1411';

type LegProps = {
  className: string;
  lowerClass: string;
  far?: boolean;
  /** upper segment path, lower segment path, paw center x (paw y is shared) */
  upper: string;
  lower: string;
  pawX: number;
};

function Leg({ className, lowerClass, far, upper, lower, pawX }: LegProps) {
  const fill = far ? FUR_FAR : FUR;
  return (
    <g className={className}>
      <path d={upper} fill={fill} />
      <g className={lowerClass}>
        <path d={lower} fill={fill} />
        {/* Paw with a lighter sock, as on a tolling retriever */}
        <ellipse cx={pawX} cy={166} rx={12} ry={6.5} fill={far ? '#D9C6AC' : CREAM} />
        <path
          d={`M${pawX - 4} 164 v4 M${pawX + 1} 163.5 v4.5 M${pawX + 6} 164 v4`}
          stroke={INK}
          strokeOpacity={0.25}
          strokeWidth={1}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export function RunningDog({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 190"
      className={`dog-anim ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="dog-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D8793F" />
          <stop offset="0.55" stopColor="#C0622B" />
          <stop offset="1" stopColor="#A04A20" />
        </linearGradient>
        <clipPath id="dog-body">
          <path d="M72 84 C70 64 92 52 128 52 C156 52 178 50 198 58 C214 64 220 82 214 98 C208 112 190 116 168 116 L108 116 C86 116 73 104 72 84 Z" />
        </clipPath>
        <radialGradient id="dog-shine" cx="0.4" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#FFD2A3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFD2A3" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow: pulses with the stride */}
      <ellipse className="dog-shadow" cx={150} cy={175} rx={92} ry={5.5} fill={INK} opacity={0.22} />

      <g className="dog-bob">
        <g className="dog-pitch">
          {/* Tail: base segment wags, the feathered tip trails slightly behind */}
          <g className="dog-tail">
            <path
              d="M80 76 C58 70 42 52 36 30 C33 21 41 17 46 24 C53 40 66 56 86 64 Z"
              fill={FUR}
            />
            <g className="dog-tail-tip">
              <path
                d="M40 36 C36 26 36 18 41 15 C47 14 49 22 46 30 C44 35 42 38 40 36 Z"
                fill={CREAM}
              />
            </g>
          </g>

          {/* Far-side legs (darker, behind the body) */}
          <Leg
            className="dog-leg dog-leg-fr"
            lowerClass="dog-knee dog-knee-fr"
            far
            upper="M168 88 C166 80 188 80 188 90 L186 126 C184 134 172 134 170 126 Z"
            lower="M171 124 C171 120 185 120 185 124 L183 160 L172 160 Z"
            pawX={178}
          />
          <Leg
            className="dog-leg dog-leg-fh"
            lowerClass="dog-knee dog-knee-fh"
            far
            upper="M86 84 C82 72 118 68 126 84 L126 124 C122 134 100 134 94 122 Z"
            lower="M98 122 C98 118 120 118 120 122 L114 160 L102 160 Z"
            pawX={108}
          />

          {/* Body */}
          <path
            d="M72 84 C70 64 92 52 128 52 C156 52 178 50 198 58 C214 64 220 82 214 98 C208 112 190 116 168 116 L108 116 C86 116 73 104 72 84 Z"
            fill={FUR}
          />
          <path
            d="M72 84 C70 64 92 52 128 52 C156 52 178 50 198 58 C214 64 220 82 214 98 C208 112 190 116 168 116 L108 116 C86 116 73 104 72 84 Z"
            fill="url(#dog-shine)"
          />
          {/* Belly shade and saddle highlight */}
          <path d="M88 108 C120 118 170 118 204 106 L204 118 L88 118 Z" fill="#3A1306" opacity={0.22} clipPath="url(#dog-body)" />
          <path
            d="M96 62 C124 54 160 54 188 62"
            fill="none"
            stroke="#F2A56E"
            strokeOpacity={0.55}
            strokeWidth={3}
            strokeLinecap="round"
            clipPath="url(#dog-body)"
          />
          {/* Chest */}
          <ellipse cx={204} cy={98} rx={13} ry={16} fill={CREAM} opacity={0.95} />

          {/* Neck */}
          <path d="M190 64 C198 44 214 38 228 42 L234 86 C220 94 204 96 192 90 Z" fill={FUR} />

          {/* Near-side legs */}
          <Leg
            className="dog-leg dog-leg-nf"
            lowerClass="dog-knee dog-knee-nf"
            upper="M184 88 C182 80 206 80 206 90 L204 126 C202 134 190 134 188 126 Z"
            lower="M189 124 C189 120 203 120 203 124 L201 160 L190 160 Z"
            pawX={196}
          />
          <Leg
            className="dog-leg dog-leg-nh"
            lowerClass="dog-knee dog-knee-nh"
            upper="M70 84 C66 72 104 68 112 84 L112 124 C108 134 86 134 80 122 Z"
            lower="M84 122 C84 118 106 118 106 122 L100 160 L88 160 Z"
            pawX={94}
          />

          {/* Collar in the brand coral, with a swinging tag */}
          <path
            d="M200 64 C212 74 228 78 240 72"
            fill="none"
            stroke="#F08A8A"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d="M200 62 C212 72 228 76 240 70"
            fill="none"
            stroke="#FFC9C9"
            strokeOpacity={0.6}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <g className="dog-tag">
            <circle cx={224} cy={84} r={4.6} fill={CREAM} />
            <circle cx={224} cy={84} r={4.6} fill="none" stroke="#D85F5F" strokeWidth={1.2} />
            <circle cx={222.8} cy={82.8} r={1.1} fill="#FFFFFF" opacity={0.8} />
          </g>

          {/* Head */}
          <g className="dog-head">
            {/* Far ear peeks above the skull */}
            <g className="dog-ear-far">
              <path d="M238 32 C246 21 260 23 260 34 C260 41 253 43 246 43 Z" fill="#7F3A19" />
            </g>

            <path
              d="M206 62 C204 44 216 30 234 30 C246 30 254 36 262 42 C270 47 282 49 285 56 C288 63 281 68 272 68 C264 68 258 70 252 75 C244 84 220 86 212 76 C208 72 206 67 206 62 Z"
              fill={FUR}
            />
            <path
              d="M206 62 C204 44 216 30 234 30 C246 30 254 36 262 42 C270 47 282 49 285 56 C288 63 281 68 272 68 C264 68 258 70 252 75 C244 84 220 86 212 76 C208 72 206 67 206 62 Z"
              fill="url(#dog-shine)"
            />
            {/* Lighter muzzle and blaze */}
            <path
              d="M256 38 C263 45 272 50 283 57 C277 62 268 58 262 54 C256 50 252 44 256 38 Z"
              fill={CREAM}
              opacity={0.85}
            />
            <ellipse cx={266} cy={65} rx={13} ry={5.5} fill={CREAM} opacity={0.6} />

            {/* Tongue, then mouth line on top of it */}
            <g className="dog-tongue">
              <path d="M260 69 C266 71 267 84 261 87 C255 88 253 78 255 70 Z" fill="#F08A8A" />
              <path d="M260 72 C260.5 76 260.5 81 260 84" stroke="#D85F5F" strokeWidth={1} fill="none" strokeLinecap="round" />
            </g>
            <path
              d="M276 66 C268 71 259 70 252 72"
              fill="none"
              stroke={INK}
              strokeWidth={1.8}
              strokeLinecap="round"
            />

            {/* Nose, eye, brow */}
            <ellipse cx={283.5} cy={56} rx={5.2} ry={4.2} fill={INK} />
            <ellipse cx={282} cy={54.4} rx={1.6} ry={1} fill="#FFFFFF" opacity={0.55} />
            <ellipse cx={245} cy={46} rx={3.3} ry={3.9} fill={INK} />
            <circle cx={246.2} cy={44.4} r={1.2} fill="#FFFFFF" />
            <path d="M239 40 C243 38 248 38.5 251 41" fill="none" stroke="#7F3A19" strokeWidth={1.6} strokeLinecap="round" />

            {/* Near ear: long, floppy, lags and flicks with the wind */}
            <g className="dog-ear">
              <path
                d="M226 36 C212 32 198 42 198 60 C198 74 208 84 218 80 C226 74 230 56 230 42 Z"
                fill={FUR_EAR}
              />
              <path
                d="M222 42 C212 42 204 52 205 64 C206 72 211 76 214 74"
                fill="none"
                stroke="#6B2E12"
                strokeOpacity={0.45}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
