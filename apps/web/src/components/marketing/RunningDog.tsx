/**
 * Long-coat chihuahua running (side view, facing right) as layered SVG, modelled on the
 * owner's real dog (reference photo): red-chocolate coat, cream "points" (white eyebrow
 * patches, cream muzzle and cheeks), brown nose, big dark eyes, large pointed ears with a fuzzy
 * rim, fluffy cream ruff at the neck, white front socks and a feathered plume tail.
 *
 * Why one SVG with CSS animation instead of video/Lottie: no dependency, crisp at any size.
 * Every joint is its own group so the gait stays plausible:
 *   - each leg = upper segment swinging at shoulder/hip + lower segment folding at elbow/hock
 *   - diagonal pairs run in anti-phase, far-side legs are darker to give depth
 *   - body bobs at twice the stride rate, head nods, erect ears bounce, plume tail wags fast
 * Pivot points live in globals.css (.dog-* rules) in the same user units; keep them in sync.
 */

const FUR = 'url(#dog-fur)';
const FUR_FAR = '#5E321D';
const CREAM = '#F6EAD8';
const SOCK = '#EBD8BE';
const SOCK_FAR = '#C9AF90';
const INK = '#1B1411';
const NOSE = '#6A4232';
const EAR_OUTER = '#7A4228';
const EAR_INNER = '#C9A084';

const BODY_PATH =
  'M100 112 C98 94 112 86 140 86 C168 86 192 88 202 100 C210 112 204 134 184 140 C166 144 130 144 112 140 C102 136 100 124 100 112 Z';

type LegProps = {
  className: string;
  lowerClass: string;
  far?: boolean;
  upper: string;
  lower: string;
  pawX: number;
};

function Leg({ className, lowerClass, far, upper, lower, pawX }: LegProps) {
  return (
    <g className={className}>
      <path d={upper} fill={far ? FUR_FAR : FUR} />
      <g className={lowerClass}>
        {/* Pale "socks": this dog's legs are cream below the elbow/hock */}
        <path d={lower} fill={far ? SOCK_FAR : SOCK} />
        <ellipse cx={pawX} cy={168.5} rx={9} ry={4.8} fill={far ? SOCK_FAR : CREAM} />
        <path
          d={`M${pawX - 3} 167 v3 M${pawX + 0.5} 166.6 v3.6 M${pawX + 4} 167 v3`}
          stroke={INK}
          strokeOpacity={0.25}
          strokeWidth={0.9}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export function RunningDog({ className }: { className?: string }) {
  return (
    <svg
      viewBox="50 0 230 190"
      className={`dog-anim ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="dog-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9633A" />
          <stop offset="0.6" stopColor="#8E4E2D" />
          <stop offset="1" stopColor="#6E3A22" />
        </linearGradient>
        <linearGradient id="dog-ruff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9B48A" />
          <stop offset="1" stopColor="#F6EAD8" />
        </linearGradient>
        <radialGradient id="dog-shine" cx="0.4" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#E8B48A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#E8B48A" stopOpacity="0" />
        </radialGradient>
        <clipPath id="dog-body">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {/* Ground shadow: pulses with the stride */}
      <ellipse className="dog-shadow" cx={160} cy={175} rx={68} ry={5} fill={INK} opacity={0.22} />

      <g className="dog-bob">
        <g className="dog-pitch">
          {/* Feathered plume tail: base wags, the cream-edged tip trails */}
          <g className="dog-tail">
            <path
              d="M104 106 C82 100 64 82 68 60 C70 49 80 48 83 56 C82 70 92 84 110 94 Z"
              fill={FUR}
            />
            {/* Feathering along the underside of the plume */}
            <path
              d="M98 99 C88 92 78 82 76 70"
              fill="none"
              stroke="#D9B48A"
              strokeOpacity={0.7}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <g className="dog-tail-tip">
              <path
                d="M66 68 C62 56 64 45 73 43 C82 43 85 53 81 62 C79 68 71 74 66 68 Z"
                fill="url(#dog-ruff)"
              />
              <path
                d="M68 62 C67 54 70 48 75 46 M74 66 C73 58 76 51 79 49"
                fill="none"
                stroke="#B98B62"
                strokeOpacity={0.6}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Far-side legs (darker, behind the body) */}
          <Leg
            className="dog-leg dog-leg-fr"
            lowerClass="dog-knee dog-knee-fr"
            far
            upper="M169 120 C169 114 183 114 183 120 L181 146 C180 150 172 150 171 146 Z"
            lower="M171 144 C171 141 181 141 181 144 L180 166 L172 166 Z"
            pawX={176}
          />
          <Leg
            className="dog-leg dog-leg-fh"
            lowerClass="dog-knee dog-knee-fh"
            far
            upper="M118 112 C116 102 142 102 142 114 L138 144 C134 150 122 150 120 142 Z"
            lower="M122 142 C122 139 134 139 134 142 L132 166 L123 166 Z"
            pawX={127}
          />

          {/* Body */}
          <path d={BODY_PATH} fill={FUR} />
          <path d={BODY_PATH} fill="url(#dog-shine)" />
          {/* Cream belly and inner thighs, as in the photo */}
          <path
            d="M104 126 C130 146 176 146 202 124 L202 150 L104 150 Z"
            fill={SOCK}
            opacity={0.85}
            clipPath="url(#dog-body)"
          />
          <path
            d="M110 94 C134 88 168 88 192 96"
            fill="none"
            stroke="#E8B48A"
            strokeOpacity={0.55}
            strokeWidth={3}
            strokeLinecap="round"
            clipPath="url(#dog-body)"
          />

          {/* Near-side legs */}
          <Leg
            className="dog-leg dog-leg-nf"
            lowerClass="dog-knee dog-knee-nf"
            upper="M181 120 C181 114 195 114 195 120 L193 146 C192 150 184 150 183 146 Z"
            lower="M183 144 C183 141 193 141 193 144 L192 166 L184 166 Z"
            pawX={188}
          />
          <Leg
            className="dog-leg dog-leg-nh"
            lowerClass="dog-knee dog-knee-nh"
            upper="M104 112 C102 102 128 102 128 114 L124 144 C120 150 108 150 106 142 Z"
            lower="M108 142 C108 139 120 139 120 142 L118 166 L109 166 Z"
            pawX={113}
          />
          {/* Neck and fluffy cream ruff */}
          <path d="M190 100 C196 86 208 80 220 82 L226 108 C214 116 200 116 192 110 Z" fill={FUR} />
          <path
            d="M188 98 C182 106 187 112 183 120 C190 121 191 128 198 127 C200 133 208 133 211 127 C217 129 224 125 223 117 C229 113 229 105 224 99 Z"
            fill="url(#dog-ruff)"
          />
          <path
            d="M192 106 C190 112 192 118 194 122 M200 108 C199 116 200 122 202 126 M209 108 C209 116 210 122 211 125 M217 106 C218 112 218 118 217 121"
            fill="none"
            stroke="#B98B62"
            strokeOpacity={0.55}
            strokeWidth={1.1}
            strokeLinecap="round"
          />

          {/* Head */}
          <g className="dog-head">
            {/* Far ear, behind the skull */}
            <g className="dog-ear-far">
              <path d="M232 52 C236 32 248 14 260 10 C266 26 262 44 252 58 Z" fill="#6A3820" />
              <path d="M240 50 C243 36 250 24 257 20 C259 32 256 44 250 54 Z" fill={EAR_INNER} opacity={0.8} />
            </g>

            {/* Skull + short muzzle + chin as one soft silhouette */}
            <g>
              <ellipse cx={226} cy={78} rx={33} ry={31} fill={FUR} />
              <ellipse cx={252} cy={90} rx={16} ry={11.5} fill={FUR} />
              <ellipse cx={246} cy={99} rx={11} ry={6} fill={FUR} />
              <ellipse cx={226} cy={78} rx={33} ry={31} fill="url(#dog-shine)" />

              {/* Cream points: cheek, muzzle and chin */}
              <path
                d="M236 84 C240 78 252 78 262 84 C268 88 268 96 260 100 C252 104 240 102 234 96 C230 92 232 88 236 84 Z"
                fill={CREAM}
              />
              <path d="M222 92 C226 86 232 86 236 90 C238 96 234 102 228 102 C222 100 220 96 222 92 Z" fill="#E3C9A4" opacity={0.85} />
              {/* White eyebrow patch above the eye: this dog's signature marking */}
              <ellipse cx={241} cy={59} rx={9} ry={5} transform="rotate(-14 241 59)" fill={CREAM} />
              <ellipse cx={241} cy={59} rx={9} ry={5} transform="rotate(-14 241 59)" fill="none" stroke="#E3C9A4" strokeWidth={0.8} />
            </g>

            {/* Tongue, then the soft smile on top */}
            <g className="dog-tongue">
              <path d="M252 98 C258 100 259 112 253 114 C247 115 246 106 248 99 Z" fill="#F08A8A" />
              <path d="M252 101 C252.5 105 252.5 109 252 111" stroke="#D85F5F" strokeWidth={0.9} fill="none" strokeLinecap="round" />
            </g>
            <path
              d="M266 94 C260 100 252 100 245 97"
              fill="none"
              stroke="#5A3A2C"
              strokeWidth={1.5}
              strokeLinecap="round"
            />

            {/* Brown nose, as in the photo (not black) */}
            <ellipse cx={265} cy={84} rx={5.6} ry={4.4} fill={NOSE} />
            <ellipse cx={263.6} cy={82.4} rx={1.8} ry={1} fill="#FFFFFF" opacity={0.5} />
            <circle cx={257} cy={91} r={0.9} fill="#5A3A2C" opacity={0.45} />
            <circle cx={261} cy={93} r={0.9} fill="#5A3A2C" opacity={0.45} />

            {/* Big dark eye with a warm brown rim and two catchlights */}
            <ellipse cx={240} cy={74} rx={8} ry={9} fill="#2A1612" />
            <ellipse cx={240} cy={74} rx={8} ry={9} fill="none" stroke="#6A4232" strokeWidth={1.1} />
            <circle cx={243} cy={70.5} r={3} fill="#FFFFFF" />
            <circle cx={237.5} cy={78.5} r={1.5} fill="#FFFFFF" opacity={0.7} />

            {/* Near ear: huge, erect, fuzzy rim, tan inner with fur strokes */}
            <g className="dog-ear">
              <path d="M204 60 C194 42 192 20 200 4 C214 8 228 26 234 48 Z" fill={EAR_OUTER} />
              <path d="M207 56 C200 42 199 26 204 14 C214 20 224 32 228 46 Z" fill={EAR_INNER} />
              <path
                d="M209 52 C205 42 205 32 208 24 M214 52 C211 42 212 34 215 28 M219 50 C217 42 218 36 221 32"
                fill="none"
                stroke="#A8785A"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
              {/* Fuzzy rim: light dotted fur along the outer edge */}
              <path
                d="M203 58 C194 42 192 22 200 5 C213 9 227 26 233 47"
                fill="none"
                stroke="#E3C9A4"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="0.1 3.2"
              />
            </g>
          </g>

          {/* Collar and tag */}
          <path
            d="M198 100 C208 110 222 112 232 106"
            fill="none"
            stroke="#F08A8A"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <path
            d="M198 98.5 C208 108.5 222 110.5 232 104.5"
            fill="none"
            stroke="#FFC9C9"
            strokeOpacity={0.6}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <g className="dog-tag">
            <circle cx={214} cy={116} r={4.4} fill={CREAM} />
            <circle cx={214} cy={116} r={4.4} fill="none" stroke="#D85F5F" strokeWidth={1.2} />
            <circle cx={212.9} cy={114.9} r={1} fill="#FFFFFF" opacity={0.85} />
          </g>
        </g>
      </g>
    </svg>
  );
}
