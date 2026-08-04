import React from 'react';

// =============================================================================
// CHARACTER + SCENE KIT for "The $10 Decision".
// Everything here is hand-drawn SVG — no image files, no AI generation. Flat
// children's-book vector: rounded silhouettes, two-tone shading, simple faces.
// Every character draws inside a 100x160 box anchored at the FEET (0,160), so a
// scene can place them on a ground line without per-character fiddling.
// =============================================================================

export type Mood = 'happy' | 'worried' | 'surprised' | 'sly' | 'kind';

// --- palette -----------------------------------------------------------------
export const P = {
  jakeSkin: '#f0b98a',
  jakeSkinShade: '#dda274',
  jakeHair: '#5a3a22',
  jakeShirt: '#5fa860',
  jakeShirtShade: '#4a8a4c',
  jakePants: '#3f6ea8',

  mayaSkin: '#a9683f',
  mayaSkinShade: '#8f5533',
  mayaHair: '#2b1c14',
  mayaTop: '#a86bbf',
  mayaTopShade: '#8d55a2',
  mayaSkirt: '#f0c04a',

  bankerArmor: '#6b4a9e',
  bankerArmorShade: '#553c80',
  bankerGold: '#e8bf5a',
  bankerGoldShade: '#c9a044',
  bankerSkin: '#e8c4a0',
  bankerBeard: '#c9cdd6',

  jackCoat: '#4a4f66',
  jackCoatShade: '#383c50',
  jackSkin: '#c9a888',
  jackHat: '#2e3244',

  granSkin: '#e8c4a0',
  granHair: '#cfd4dc',
  granDress: '#d98aa8',

  ink: '#2a2438',
  white: '#ffffff',
} as const;

// --- shared face -------------------------------------------------------------
const Face: React.FC<{ mood: Mood; cx: number; cy: number; s?: number }> = ({ mood, cx, cy, s = 1 }) => {
  const eyeDx = 11 * s;
  const eyeY = cy - 2 * s;
  const browY = eyeY - 11 * s;
  return (
    <g>
      {mood === 'surprised' ? (
        <>
          <ellipse cx={cx - eyeDx} cy={eyeY} rx={4.2 * s} ry={5.4 * s} fill={P.ink} />
          <ellipse cx={cx + eyeDx} cy={eyeY} rx={4.2 * s} ry={5.4 * s} fill={P.ink} />
        </>
      ) : mood === 'happy' ? (
        <>
          <path d={`M${cx - eyeDx - 5 * s} ${eyeY + 1 * s} q${5 * s} ${-7 * s} ${10 * s} 0`}
                stroke={P.ink} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx + eyeDx - 5 * s} ${eyeY + 1 * s} q${5 * s} ${-7 * s} ${10 * s} 0`}
                stroke={P.ink} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={cx - eyeDx} cy={eyeY} r={3.8 * s} fill={P.ink} />
          <circle cx={cx + eyeDx} cy={eyeY} r={3.8 * s} fill={P.ink} />
        </>
      )}

      {/* brows carry most of the emotion */}
      {mood === 'worried' && (
        <>
          <path d={`M${cx - eyeDx - 6 * s} ${browY + 4 * s} q${6 * s} ${-4 * s} ${12 * s} ${1 * s}`}
                stroke={P.ink} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx + eyeDx - 6 * s} ${browY + 5 * s} q${6 * s} ${-5 * s} ${12 * s} ${-1 * s}`}
                stroke={P.ink} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === 'sly' && (
        <path d={`M${cx - eyeDx - 6 * s} ${browY + 6 * s} q${eyeDx + 6 * s} ${-6 * s} ${2 * eyeDx + 12 * s} 0`}
              stroke={P.ink} strokeWidth={2.6 * s} fill="none" strokeLinecap="round" />
      )}

      {/* mouth */}
      {mood === 'worried' ? (
        <path d={`M${cx - 7 * s} ${cy + 15 * s} q${7 * s} ${-5 * s} ${14 * s} 0`}
              stroke={P.ink} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
      ) : mood === 'surprised' ? (
        <ellipse cx={cx} cy={cy + 15 * s} rx={5 * s} ry={6 * s} fill={P.ink} />
      ) : mood === 'sly' ? (
        <path d={`M${cx - 8 * s} ${cy + 12 * s} q${8 * s} ${6 * s} ${16 * s} ${-2 * s}`}
              stroke={P.ink} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${cx - 9 * s} ${cy + 11 * s} q${9 * s} ${10 * s} ${18 * s} 0`}
              stroke={P.ink} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />
      )}
      {/* cheeks */}
      {(mood === 'happy' || mood === 'kind') && (
        <>
          <circle cx={cx - eyeDx - 8 * s} cy={cy + 9 * s} r={4.5 * s} fill="#f2907f" opacity={0.35} />
          <circle cx={cx + eyeDx + 8 * s} cy={cy + 9 * s} r={4.5 * s} fill="#f2907f" opacity={0.35} />
        </>
      )}
    </g>
  );
};

// =============================================================================
// KIDS — Jake and Maya share a body rig, differing in palette and hair.
// =============================================================================
const KidBody: React.FC<{ shirt: string; shirtShade: string; pants: string; skin: string }> = ({
  shirt, shirtShade, pants, skin,
}) => (
  <g>
    {/* legs */}
    <rect x={34} y={116} width={12} height={30} rx={6} fill={pants} />
    <rect x={54} y={116} width={12} height={30} rx={6} fill={pants} />
    {/* shoes */}
    <rect x={30} y={142} width={20} height={11} rx={5.5} fill={P.ink} />
    <rect x={50} y={142} width={20} height={11} rx={5.5} fill={P.ink} />
    {/* torso */}
    <path d="M28 74 q22 -8 44 0 l6 46 q-28 8 -56 0 z" fill={shirt} />
    <path d="M50 74 q11 -4 22 0 l6 46 q-14 4 -28 0 z" fill={shirtShade} opacity={0.55} />
    {/* arms */}
    <rect x={18} y={76} width={12} height={40} rx={6} fill={shirt} />
    <rect x={70} y={76} width={12} height={40} rx={6} fill={shirt} />
    <circle cx={24} cy={118} r={7} fill={skin} />
    <circle cx={76} cy={118} r={7} fill={skin} />
  </g>
);

export const Jake: React.FC<{ mood?: Mood }> = ({ mood = 'happy' }) => (
  <g>
    <KidBody shirt={P.jakeShirt} shirtShade={P.jakeShirtShade} pants={P.jakePants} skin={P.jakeSkin} />
    <circle cx={50} cy={46} r={32} fill={P.jakeSkin} />
    <path d="M50 78 a32 32 0 0 0 26 -14 l0 14 z" fill={P.jakeSkinShade} opacity={0.4} />
    {/* short scruffy hair */}
    <path d="M19 40 q4 -28 31 -28 q27 0 31 28 q-8 -12 -18 -8 q-6 -9 -14 -5 q-9 -3 -14 6 q-9 -1 -16 7 z" fill={P.jakeHair} />
    <Face mood={mood} cx={50} cy={48} />
  </g>
);

export const Maya: React.FC<{ mood?: Mood }> = ({ mood = 'happy' }) => (
  <g>
    {/* skirt instead of shorts */}
    <rect x={34} y={116} width={12} height={30} rx={6} fill="#7a4a2c" />
    <rect x={54} y={116} width={12} height={30} rx={6} fill="#7a4a2c" />
    <rect x={30} y={142} width={20} height={11} rx={5.5} fill={P.ink} />
    <rect x={50} y={142} width={20} height={11} rx={5.5} fill={P.ink} />
    <path d="M24 108 q26 -10 52 0 l-4 16 q-22 7 -44 0 z" fill={P.mayaSkirt} />
    <path d="M28 74 q22 -8 44 0 l4 38 q-26 8 -52 0 z" fill={P.mayaTop} />
    <path d="M50 74 q11 -4 22 0 l4 38 q-13 4 -26 0 z" fill={P.mayaTopShade} opacity={0.5} />
    <rect x={18} y={76} width={12} height={40} rx={6} fill={P.mayaTop} />
    <rect x={70} y={76} width={12} height={40} rx={6} fill={P.mayaTop} />
    <circle cx={24} cy={118} r={7} fill={P.mayaSkin} />
    <circle cx={76} cy={118} r={7} fill={P.mayaSkin} />
    {/* two hair puffs */}
    <circle cx={20} cy={34} r={15} fill={P.mayaHair} />
    <circle cx={80} cy={34} r={15} fill={P.mayaHair} />
    <circle cx={50} cy={46} r={32} fill={P.mayaSkin} />
    <path d="M50 78 a32 32 0 0 0 26 -14 l0 14 z" fill={P.mayaSkinShade} opacity={0.4} />
    <path d="M18 44 q2 -32 32 -32 q30 0 32 32 q-10 -16 -32 -16 q-22 0 -32 16 z" fill={P.mayaHair} />
    <Face mood={mood} cx={50} cy={48} />
  </g>
);

// =============================================================================
// IRON BANKER — deep purple + gold armour, grey beard, deliberately warm.
// =============================================================================
export const IronBanker: React.FC<{ mood?: Mood }> = ({ mood = 'kind' }) => (
  <g>
    <rect x={32} y={120} width={14} height={26} rx={7} fill={P.bankerArmorShade} />
    <rect x={54} y={120} width={14} height={26} rx={7} fill={P.bankerArmorShade} />
    <rect x={26} y={142} width={24} height={12} rx={6} fill={P.ink} />
    <rect x={50} y={142} width={24} height={12} rx={6} fill={P.ink} />
    {/* breastplate */}
    <path d="M22 66 q28 -12 56 0 l6 60 q-34 10 -68 0 z" fill={P.bankerArmor} />
    <path d="M50 60 q14 -5 28 5 l6 60 q-17 5 -34 0 z" fill={P.bankerArmorShade} opacity={0.6} />
    {/* gold trim + belt */}
    <path d="M22 66 q28 -12 56 0 l2 9 q-30 -11 -60 0 z" fill={P.bankerGold} />
    <rect x={19} y={104} width={62} height={11} rx={4} fill={P.bankerGold} />
    <rect x={43} y={102} width={14} height={15} rx={3} fill={P.bankerGoldShade} />
    {/* pauldrons */}
    <ellipse cx={18} cy={72} rx={14} ry={11} fill={P.bankerGold} />
    <ellipse cx={82} cy={72} rx={14} ry={11} fill={P.bankerGold} />
    <rect x={10} y={78} width={13} height={40} rx={6.5} fill={P.bankerArmor} />
    <rect x={77} y={78} width={13} height={40} rx={6.5} fill={P.bankerArmor} />
    <circle cx={16} cy={120} r={7.5} fill={P.bankerSkin} />
    <circle cx={84} cy={120} r={7.5} fill={P.bankerSkin} />
    {/* head */}
    <circle cx={50} cy={40} r={28} fill={P.bankerSkin} />
    {/* beard sits BELOW the mouth line — starting it at the cheeks read as a hood */}
    <path d="M25 54 q6 30 25 30 q19 0 25 -30 q-9 12 -25 12 q-16 0 -25 -12 z" fill={P.bankerBeard} />
    <path d="M22 32 q6 -24 28 -24 q22 0 28 24 q-12 -13 -28 -13 q-16 0 -28 13 z" fill={P.bankerBeard} />
    <Face mood={mood} cx={50} cy={38} s={0.92} />
  </g>
);

// =============================================================================
// JACK THE RUINER — sneaky, comic, never frightening. Hides behind things.
// =============================================================================
export const JackRuiner: React.FC<{ mood?: Mood }> = ({ mood = 'sly' }) => (
  <g>
    <rect x={36} y={122} width={12} height={24} rx={6} fill={P.jackCoatShade} />
    <rect x={52} y={122} width={12} height={24} rx={6} fill={P.jackCoatShade} />
    <rect x={31} y={142} width={21} height={11} rx={5.5} fill={P.ink} />
    <rect x={48} y={142} width={21} height={11} rx={5.5} fill={P.ink} />
    {/* long coat with a big collar he can duck into */}
    <path d="M26 74 q24 -10 48 0 l8 54 q-32 9 -64 0 z" fill={P.jackCoat} />
    <path d="M50 70 q12 -4 24 4 l8 54 q-16 4 -32 0 z" fill={P.jackCoatShade} opacity={0.6} />
    <path d="M26 74 q10 -12 24 -4 q14 -8 24 4 q-12 14 -24 6 q-12 8 -24 -6 z" fill={P.jackCoatShade} />
    <rect x={16} y={78} width={11} height={42} rx={5.5} fill={P.jackCoat} />
    <rect x={73} y={78} width={11} height={42} rx={5.5} fill={P.jackCoat} />
    <circle cx={21} cy={122} r={6.5} fill={P.jackSkin} />
    <circle cx={79} cy={122} r={6.5} fill={P.jackSkin} />
    <circle cx={50} cy={46} r={26} fill={P.jackSkin} />
    {/* flat cap — brim clears the eyes, or his whole face reads blank */}
    <path d="M22 30 q6 -22 28 -22 q22 0 28 22 q-28 -10 -56 0 z" fill={P.jackHat} />
    <ellipse cx={50} cy={31} rx={31} ry={6} fill={P.jackHat} />
    <Face mood={mood} cx={50} cy={50} s={0.95} />
  </g>
);

// =============================================================================
// GRANDMA — one warm appearance.
// =============================================================================
export const Grandma: React.FC<{ mood?: Mood }> = ({ mood = 'kind' }) => (
  <g>
    <rect x={34} y={124} width={13} height={22} rx={6.5} fill="#8a7d92" />
    <rect x={53} y={124} width={13} height={22} rx={6.5} fill="#8a7d92" />
    <rect x={29} y={142} width={22} height={11} rx={5.5} fill={P.ink} />
    <rect x={49} y={142} width={22} height={11} rx={5.5} fill={P.ink} />
    <path d="M24 72 q26 -10 52 0 l8 58 q-34 9 -68 0 z" fill={P.granDress} />
    <path d="M50 68 q13 -4 26 4 l8 58 q-17 4 -34 0 z" fill="#c2758f" opacity={0.55} />
    <rect x={16} y={76} width={12} height={44} rx={6} fill={P.granDress} />
    <rect x={72} y={76} width={12} height={44} rx={6} fill={P.granDress} />
    <circle cx={22} cy={122} r={7} fill={P.granSkin} />
    <circle cx={78} cy={122} r={7} fill={P.granSkin} />
    <circle cx={50} cy={44} r={28} fill={P.granSkin} />
    <path d="M20 40 q6 -26 30 -26 q24 0 30 26 q-14 -14 -30 -14 q-16 0 -30 14 z" fill={P.granHair} />
    <circle cx={50} cy={13} r={12} fill={P.granHair} />
    {/* spectacles */}
    <circle cx={39} cy={46} r={10} stroke={P.ink} strokeWidth={2.2} fill="none" opacity={0.55} />
    <circle cx={61} cy={46} r={10} stroke={P.ink} strokeWidth={2.2} fill="none" opacity={0.55} />
    <Face mood={mood} cx={50} cy={44} s={0.9} />
  </g>
);

// =============================================================================
// CLASSMATE — anonymous background kid. `v` varies palette and hair so a crowd
// reads as different children without needing separate art.
// =============================================================================
const CLASS_SKINS = ['#f0b98a', '#a9683f', '#e8c4a0', '#8a5a3a', '#f5cfa8', '#c98a5e'];
const CLASS_SHIRTS = ['#e0806b', '#6b9ed4', '#7fbf7a', '#d4a24a', '#a88ad4', '#5fb8b0'];
const CLASS_HAIR = ['#3a2418', '#5a3a22', '#2b1c14', '#7a5230', '#1f1a15', '#4a2f1c'];

export const Classmate: React.FC<{ v: number; mood?: Mood }> = ({ v, mood = 'happy' }) => {
  const skin = CLASS_SKINS[v % CLASS_SKINS.length];
  const shirt = CLASS_SHIRTS[v % CLASS_SHIRTS.length];
  const hair = CLASS_HAIR[v % CLASS_HAIR.length];
  const puffs = v % 2 === 1;
  return (
    <g>
      <rect x={36} y={118} width={11} height={28} rx={5.5} fill="#4a5a70" />
      <rect x={53} y={118} width={11} height={28} rx={5.5} fill="#4a5a70" />
      <rect x={32} y={142} width={19} height={11} rx={5.5} fill={P.ink} />
      <rect x={49} y={142} width={19} height={11} rx={5.5} fill={P.ink} />
      <path d="M30 76 q20 -8 40 0 l5 44 q-25 8 -50 0 z" fill={shirt} />
      <rect x={21} y={78} width={11} height={38} rx={5.5} fill={shirt} />
      <rect x={68} y={78} width={11} height={38} rx={5.5} fill={shirt} />
      <circle cx={26} cy={118} r={6.5} fill={skin} />
      <circle cx={74} cy={118} r={6.5} fill={skin} />
      {puffs && (
        <>
          <circle cx={22} cy={38} r={13} fill={hair} />
          <circle cx={78} cy={38} r={13} fill={hair} />
        </>
      )}
      <circle cx={50} cy={48} r={29} fill={skin} />
      <path d="M21 44 q3 -30 29 -30 q26 0 29 30 q-10 -15 -29 -15 q-19 0 -29 15 z" fill={hair} />
      <Face mood={mood} cx={50} cy={50} s={0.9} />
    </g>
  );
};

// =============================================================================
// THE SWIPE — deliberately NOT a person. A crackling shimmer that flatters
// whatever sits behind it. `t` is 0..1 within the beat and drives the flicker.
// =============================================================================
export const TheSwipe: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 0.72 + Math.sin(t * Math.PI * 6) * 0.22;
  const bolt = 'M52 6 L30 66 L48 66 L38 118 L74 50 L54 50 L70 6 Z';
  return (
    <g>
      <ellipse cx={52} cy={62} rx={54} ry={66} fill="#7ce0d4" opacity={0.2 * pulse} />
      <ellipse cx={52} cy={62} rx={38} ry={50} fill="#a8f0e6" opacity={0.28 * pulse} />
      <path d={bolt} fill="#ffe9a8" opacity={0.95} />
      <path d={bolt} fill="none" stroke="#ffffff" strokeWidth={3} opacity={pulse} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + t * 2.2;
        return (
          <circle key={i} cx={52 + Math.cos(a) * 52} cy={62 + Math.sin(a) * 60}
                  r={3.4} fill="#ffffff" opacity={0.5 + 0.4 * Math.sin(t * 10 + i)} />
        );
      })}
    </g>
  );
};

// =============================================================================
// STAGE — places a character on the scene's ground line.
//   <Stage x={540} y={1180} scale={3.2}><Jake mood="happy" /></Stage>
// x/y are canvas pixels; y is where the FEET land.
// =============================================================================
export const Stage: React.FC<{
  x: number; y: number; scale?: number; flip?: boolean; children: React.ReactNode;
}> = ({ x, y, scale = 1, flip = false, children }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) translate(-50 -160)`}>
    {children}
  </g>
);
