import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Classmate, Grandma, IronBanker, Jake, JackRuiner, Maya, Stage, TheSwipe } from '../../lib/tendollar';
import { FONT_BODY } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG — cast sheet for "The $10 Decision".
// Not part of the story: a reference board for reviewing the hand-drawn SVG
// characters at size, all in one frame.
// =============================================================================
export const compositionConfig = {
  id: 'Short13Cast',
  durationInSeconds: 4,
  fps: 30,
  width: 1080,
  height: 1920,
};

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fill="#4a4458"
        style={{ fontFamily: FONT_BODY, fontSize: 26, fontWeight: 600 }}>
    {text}
  </text>
);

const Short13Cast: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg,#fdf6ec,#f3e6d4)' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Stage x={190} y={520} scale={2.5}><Jake mood="happy" /></Stage>
      <Label x={190} y={570} text="Jake" />
      <Stage x={430} y={520} scale={2.5}><Maya mood="happy" /></Stage>
      <Label x={430} y={570} text="Maya" />
      <Stage x={700} y={540} scale={2.9}><IronBanker mood="kind" /></Stage>
      <Label x={700} y={590} text="Iron Banker" />
      <Stage x={930} y={520} scale={2.5}><Grandma mood="kind" /></Stage>
      <Label x={930} y={570} text="Grandma" />

      <Stage x={220} y={1060} scale={2.6}><JackRuiner mood="sly" /></Stage>
      <Label x={220} y={1110} text="Jack the Ruiner" />
      <g transform="translate(430 900) scale(2.6)"><TheSwipe t={0.3} /></g>
      <Label x={565} y={1110} text="The Swipe" />
      <Stage x={790} y={1060} scale={2.2}><Classmate v={0} /></Stage>
      <Stage x={930} y={1060} scale={2.2}><Classmate v={1} /></Stage>
      <Label x={860} y={1110} text="classmates" />

      {/* moods on one face */}
      <Stage x={170} y={1600} scale={2.3}><Jake mood="happy" /></Stage>
      <Label x={170} y={1650} text="happy" />
      <Stage x={400} y={1600} scale={2.3}><Jake mood="worried" /></Stage>
      <Label x={400} y={1650} text="worried" />
      <Stage x={630} y={1600} scale={2.3}><Maya mood="surprised" /></Stage>
      <Label x={630} y={1650} text="surprised" />
      <Stage x={880} y={1600} scale={2.3}><JackRuiner mood="sly" /></Stage>
      <Label x={880} y={1650} text="sly" />
    </svg>
  </AbsoluteFill>
);

export default Short13Cast;
