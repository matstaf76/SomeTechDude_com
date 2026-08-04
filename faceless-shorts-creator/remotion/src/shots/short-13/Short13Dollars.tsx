import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, ProgressBar, SHORT } from '../../lib/shorts';
import { EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — "The $10 Decision", kids money story (ages 5+).
//
// This is an ANIMATIC, not the finished book. Final page art does not exist yet
// (generate_storyboard.py is blocked on Gemini billing), so each page renders as
// a designed art slot: mood-graded backdrop, focal glyph, cast list, and the
// real caption timing. Swap ART_SLOT for <KenBurnsImage> per page once the PNGs
// land and the timing, captions and pacing all carry over unchanged.
// =============================================================================
// NOTE: width/height/fps must be NUMERIC LITERALS — scripts/gen-registry.mjs parses this
// block with a regex, so `SHORT.W` silently falls back to the 1920x1080 default.
export const compositionConfig = {
  id: 'Short13Dollars',
  durationInSeconds: 143,
  fps: 30,
  width: 1080,
  height: 1920,
};

const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const XF = 18; // crossfade frames between pages

// =============================================================================
// PAGE DATA — one row per script page. `mood` drives the backdrop grade so the
// story reads emotionally even before real art: warm -> wonder -> worry ->
// threat -> relief. `cast` mirrors the refs in generate_storyboard.py.
// =============================================================================
type Page = {
  n: number;
  beat: string;
  glyph: string;
  cast: string[];
  top: string;
  bottom: string;
  tint: string;
};

const PAGES: Page[] = [
  { n: 1, beat: 'hook-bigday', glyph: '😄', cast: ['Jake', 'Maya'], top: '#ffd9a0', bottom: '#ffb877', tint: '#8a4f1d' },
  { n: 2, beat: 'fieldtrip', glyph: '🚌', cast: ['Jake', 'Maya', '+class'], top: '#ffe08a', bottom: '#f5b942', tint: '#7a5310' },
  { n: 3, beat: 'giftcard', glyph: '💳', cast: ['Jake', 'Maya', 'Grandma'], top: '#ffd2b8', bottom: '#f2a58c', tint: '#7d3f2c' },
  { n: 4, beat: 'arrive-city', glyph: '🏙️', cast: ['—'], top: '#a8d8f0', bottom: '#6fb4dd', tint: '#1d4a68' },
  { n: 5, beat: 'bank-wonder', glyph: '✨', cast: ['Jake', 'Maya', '+class'], top: '#ffe9b0', bottom: '#e8c46a', tint: '#6b4f14' },
  { n: 6, beat: 'iron-banker', glyph: '🛡️', cast: ['Iron Banker'], top: '#c9b3e8', bottom: '#9b7cc4', tint: '#3d2a5c' },
  { n: 7, beat: 'temptation-shop', glyph: '🏪', cast: ['Jake', 'Maya'], top: '#ffc9dd', bottom: '#f593b8', tint: '#7a2e4b' },
  { n: 8, beat: 'vault', glyph: '🏛️', cast: ['Iron Banker', 'Jake', 'Maya'], top: '#f0d98a', bottom: '#d4b44e', tint: '#5e4a0f' },
  { n: 9, beat: 'hunger', glyph: '🌩️', cast: ['Jake', 'Maya'], top: '#bcd4e6', bottom: '#8fb0c9', tint: '#2c4457' },
  { n: 10, beat: 'price-shock', glyph: '🤔', cast: ['Jake', 'Maya'], top: '#a9b6c9', bottom: '#7d8ca3', tint: '#242f40' },
  { n: 11, beat: 'the-swipe', glyph: '⚡', cast: ['The Swipe'], top: '#8fd8d0', bottom: '#4db8a8', tint: '#0f4a42' },
  { n: 12, beat: 'jack-ruiner', glyph: '👤', cast: ['Jack the Ruiner'], top: '#8b90a8', bottom: '#5d6480', tint: '#1b1f30' },
  { n: 13, beat: 'naming-1', glyph: '🛡️', cast: ['Iron Banker', 'Jake', 'Maya'], top: '#b9c9ea', bottom: '#8ba3d4', tint: '#22355e' },
  { n: 14, beat: 'naming-2', glyph: '💡', cast: ['The Swipe', 'Jack'], top: '#ffe38f', bottom: '#f5c84e', tint: '#6b5210' },
  { n: 15, beat: 'lunch-gift', glyph: '🍱', cast: ['Iron Banker', '+class'], top: '#ffd7a3', bottom: '#f7b169', tint: '#7c451a' },
  { n: 16, beat: 'cheer', glyph: '😂', cast: ['+whole class'], top: '#ffdf9c', bottom: '#f9bf5e', tint: '#7a5316' },
  { n: 17, beat: 'payoff-loop', glyph: '😉', cast: ['Iron Banker', 'Jake', 'Maya'], top: '#ffd9a0', bottom: '#ffb877', tint: '#8a4f1d' },
];

// Page windows come straight from the VO lines so art and narration never drift.
const WINDOWS = PAGES.map((p, i) => {
  const line = VO[i];
  return { ...p, from: Math.round(line.start * SHORT.FPS), to: Math.round(line.end * SHORT.FPS) };
});

// =============================================================================
// ART SLOT — stands in for the finished illustration. Gentle ken-burns drift and
// a breathing glyph so the page feels alive rather than static.
// =============================================================================
const ArtSlot: React.FC<{ page: Page; local: number; span: number; content: number }> = ({
  page,
  local,
  span,
  content,
}) => {
  const t = Math.max(1, span);
  const drift = interpolate(local, [0, t], [0, 1], CLAMP);
  const scale = 1.04 + drift * 0.06;
  const floatY = Math.sin((local / t) * Math.PI) * -14;
  const pop = interpolate(local, [0, 16], [0.86, 1], { ...CLAMP, easing: EASINGS.overshoot });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(168deg, ${page.top} 0%, ${page.bottom} 100%)`,
        transform: `scale(${scale})`,
        transformOrigin: '50% 45%',
      }}
    >
      {/* paper grain band — keeps the flat gradient from reading as a bug */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 590,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 400,
          lineHeight: 1,
          opacity: content,
          transform: `translateY(${floatY}px) scale(${pop})`,
        }}
      >
        {page.glyph}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// PAGE CHROME — page number, beat name, cast. Review furniture: it tells you
// which art each slot is waiting on. Delete this block for the finished cut.
// =============================================================================
const Chrome: React.FC<{ page: Page; local: number; content: number }> = ({ page, local, content }) => {
  const enter = interpolate(local, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) * content;
  const chip: React.CSSProperties = {
    display: 'inline-block',
    padding: '10px 22px',
    margin: '0 8px 10px 0',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.62)',
    color: page.tint,
    fontFamily: FONT_BODY,
    fontSize: 30,
    fontWeight: 600,
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: enter,
          transform: `translateY(${(1 - enter) * -12}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 6,
            color: page.tint,
            opacity: 0.75,
            margin: 0,
          }}
        >
          PAGE {String(page.n).padStart(2, '0')}
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 28,
            color: page.tint,
            opacity: 0.55,
            marginTop: 8,
          }}
        >
          {page.beat}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1180,
          left: 60,
          right: 60,
          textAlign: 'center',
          opacity: enter * 0.95,
        }}
      >
        {page.cast.map((c) => (
          <span key={c} style={chip}>
            {c}
          </span>
        ))}
      </div>
    </>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const Short13Dollars: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#2a1d12' }}>
      {WINDOWS.map((page, i) => {
        const next = WINDOWS[i + 1];
        // Hold each page until the next one starts so there is never a gap.
        const end = next ? next.from + XF : durationInFrames;
        if (frame < page.from - XF || frame > end) return null;

        const local = frame - page.from;
        const span = end - page.from;
        // First page has no fade-in; last page has no fade-out (loop back to page 1).
        const fadeIn = i === 0 ? 1 : interpolate(frame, [page.from - XF, page.from + XF], [0, 1], CLAMP);
        const fadeOut = next ? interpolate(frame, [end - XF * 2, end], [1, 0], CLAMP) : 1;

        // The backdrop cross-dissolves, but glyph and chrome cut in and out inside the page's
        // OWN window. Without this the labels dissolve across each other and a transition
        // frame reads "PAGE 01" over page 2's art, with both glyphs superimposed.
        const own = next ? next.from : durationInFrames;
        const content = i === 0
          ? interpolate(frame, [own - 8, own], [1, 0], CLAMP)
          : Math.min(
              interpolate(frame, [page.from, page.from + 8], [0, 1], CLAMP),
              next ? interpolate(frame, [own - 8, own], [1, 0], CLAMP) : 1,
            );

        return (
          <AbsoluteFill key={page.beat} style={{ opacity: Math.min(fadeIn, fadeOut) }}>
            <ArtSlot page={page} local={local} span={span} content={content} />
            <Chrome page={page} local={local} content={content} />
          </AbsoluteFill>
        );
      })}

      {/* Captions ride above everything; plate keeps them legible on light pages. */}
      <Captions lines={VO} y={1420} size={56} accent="#ffffff" maxWords={4} plate />
      <ProgressBar color="#f5d76e" />
    </AbsoluteFill>
  );
};

export default Short13Dollars;
