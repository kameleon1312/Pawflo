/**
 * Chihuahua puppy running (side view, facing right) as layered SVG.
 *
 * Breed traits modelled on purpose: oversized round "apple" skull, short muzzle, huge upright
 * bat ears with pink inner, big dark glossy eyes, thin short legs with small paws, round belly,
 * and a thin sickle tail curled up over the back. Coat is fawn with a pale chest and belly.
 *
 * Why one SVG with CSS animation instead of video/Lottie: no dependency, crisp at any size.
 * Every joint is its own group so the gait stays plausible:
 *   - each leg = upper segment swinging at shoulder/hip + lower segment folding at elbow/hock
 *   - diagonal pairs run in anti-phase (a puppy's quick scurry), far-side legs are darker
 *   - body bobs at twice the stride rate, head nods, erect ears bounce, tail wags fast
 * Pivot points live in globals.css (.dog-* rules) in the same user units; keep them in sync.
 */

const FUR = 'url(#dog-fur)';
const FUR_FAR = '#B98348';
const CREAM = '#FBEBD0';
const INK = '#1B1411';
const EAR_INNER = '#F2B6A6';

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
  const fill = far ? FUR_FAR : FUR;
  return (
    <g className={className}>
      <path d={upper} fill={fill} />
      <g className={lowerClass}>
        <path d={lower} fill={fill} />
        {/* Small pale paw with tiny toe lines */}
        <ellipse cx={pawX} cy={168.5} rx={8.5} ry={4.6} fill={far ? '#E5CFA9' : CREAM} />
        <path
          d={`M${pawX - 3} 167 v3 M${pawX + 0.5} 166.6 v3.6 M${pawX + 4} 167 v3`}
          stroke={INK}
          strokeOpacity={0.22}
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
          <stop offset="0" stopColor="#EDBE86" />
          <stop offset="0.6" stopColor="#DDA567" />
          <stop offset="1" stopColor="#C98B4E" />
        </linearGradient>
        <radialGradient id="dog-shine" cx="0.4" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#FFF1D6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFF1D6" stopOpacity="0" />
        </radialGradient>
        <clipPath id="dog-body">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {/* Ground shadow: pulses with the stride */}
      <ellipse className="dog-shadow" cx={160} cy={175} rx={68} ry={5} fill={INK} opacity={0.22} />

      <g className="dog-bob">
        <g className="dog-pitch">
          {/* Thin sickle tail: base wags, the pale tip trails */}
          <g className="dog-tail">
            <path
              d="M104 106 C84 100 70 84 72 66 C73 57 81 57 82 64 C82 78 92 88 108 94 Z"
              fill={FUR}
            />
            <g className="dog-tail-tip">
              <path d="M72 70 C70 62 71 55 76 55 C80 56 81 62 79 68 C77 72 74 74 72 70 Z" fill={CREAM} />
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

          {/* Round puppy body */}
          <path d={BODY_PATH} fill={FUR} />
          <path d={BODY_PATH} fill="url(#dog-shine)" />
          {/* Belly: paler, because a chihuahua's underside is lighter and softly round */}
          <path
            d="M104 126 C130 146 176 146 202 124 L202 150 L104 150 Z"
            fill={CREAM}
            opacity={0.8}
            clipPath="url(#dog-body)"
          />
          <path
            d="M110 94 C134 88 168 88 192 96"
            fill="none"
            stroke="#FFE2B8"
            strokeOpacity={0.7}
            strokeWidth={3}
            strokeLinecap="round"
            clipPath="url(#dog-body)"
          />
          {/* Pale chest */}
          <ellipse cx={197} cy={113} rx={12} ry={17} fill={CREAM} opacity={0.95} />

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

          {/* Neck */}
          <path d="M190 100 C196 86 208 80 220 82 L226 108 C214 116 200 116 192 110 Z" fill={FUR} />

          {/* Head: oversized round skull */}
          <g className="dog-head">
            {/* Far ear, behind the skull */}
            <g className="dog-ear-far">
              <path d="M232 52 C236 32 248 14 260 10 C266 26 262 44 252 58 Z" fill="#C98B4E" />
              <path d="M240 50 C243 36 250 24 257 20 C259 32 256 44 250 54 Z" fill={EAR_INNER} opacity={0.85} />
            </g>

            {/* Skull + short muzzle + chin as one soft silhouette */}
            <g>
              <ellipse cx={226} cy={78} rx={33} ry={31} fill={FUR} />
              <ellipse cx={252} cy={90} rx={16} ry={11.5} fill={FUR} />
              <ellipse cx={246} cy={99} rx={11} ry={6} fill={FUR} />
              <ellipse cx={226} cy={78} rx={33} ry={31} fill="url(#dog-shine)" />
              {/* Lighter muzzle, tan points above the eye (a classic chihuahua marking) */}
              <ellipse cx={254} cy={92} rx={13} ry={9.5} fill={CREAM} opacity={0.9} />
              <circle cx={239} cy={57} r={2.4} fill="#C98B4E" />
              <circle cx={248} cy={60} r={1.9} fill="#C98B4E" />
            </g>

            {/* Tongue, then the smiling mouth on top */}
            <g className="dog-tongue">
              <path d="M252 98 C258 100 259 112 253 114 C247 115 246 106 248 99 Z" fill="#F08A8A" />
              <path d="M252 101 C252.5 105 252.5 109 252 111" stroke="#D85F5F" strokeWidth={0.9} fill="none" strokeLinecap="round" />
            </g>
            <path
              d="M266 94 C260 100 252 100 245 97"
              fill="none"
              stroke={INK}
              strokeWidth={1.7}
              strokeLinecap="round"
            />

            {/* Nose: small, glossy black */}
            <ellipse cx={265} cy={84} rx={5.4} ry={4.2} fill={INK} />
            <ellipse cx={263.6} cy={82.4} rx={1.7} ry={1} fill="#FFFFFF" opacity={0.6} />
            {/* Whisker dots */}
            <circle cx={257} cy={91} r={0.9} fill={INK} opacity={0.35} />
            <circle cx={261} cy={93} r={0.9} fill={INK} opacity={0.35} />

            {/* Big glossy eye: the biggest cuteness lever */}
            <ellipse cx={240} cy={74} rx={8} ry={9} fill={INK} />
            <ellipse cx={240} cy={74} rx={8} ry={9} fill="none" stroke="#5A3A22" strokeWidth={1} />
            <circle cx={243} cy={70.5} r={3} fill="#FFFFFF" />
            <circle cx={237.5} cy={78.5} r={1.5} fill="#FFFFFF" opacity={0.75} />

            {/* Near ear: huge, erect, with pink inner, bounces with each stride */}
            <g className="dog-ear">
              <path d="M204 60 C194 42 192 20 200 4 C214 8 228 26 234 48 Z" fill="#D4975A" />
              <path d="M207 56 C200 42 199 26 204 14 C214 20 224 32 228 46 Z" fill={EAR_INNER} />
              <path d="M209 50 C205 40 205 30 208 22" fill="none" stroke="#E79D8D" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          </g>

          {/* Collar and tag sit over the neck, under the head's chin */}
          <path
            d="M198 100 C208 110 222 112 232 106"
            fill="none"
            stroke="#F08A8A"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M198 98.5 C208 108.5 222 110.5 232 104.5"
            fill="none"
            stroke="#FFC9C9"
            strokeOpacity={0.6}
            strokeWidth={1.4}
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
