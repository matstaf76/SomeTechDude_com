// Resolves the Chromium binary the renderer should use.
//
// By default Remotion downloads its own Chrome Headless Shell from remotion.media on first
// render. In sandboxes with a network allowlist that download 403s, so we point the renderer
// at a browser that is already on disk instead. Returns undefined when nothing local is found
// — that is the normal path on a dev machine, where Remotion downloads as usual.
//
// Override explicitly with REMOTION_BROWSER_EXECUTABLE=/path/to/chrome.
import { existsSync, readdirSync } from 'fs';
import path from 'path';

// Playwright keeps versioned dirs (chromium_headless_shell-1194/…); take the newest match.
const fromPlaywright = () => {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!existsSync(base)) return null;
  const candidates = readdirSync(base)
    .filter((d) => d.startsWith('chromium_headless_shell-') || d.startsWith('chromium-'))
    // headless_shell launches cleanly as root; the full chrome build does not.
    .sort((a, b) => (a.startsWith('chromium_headless_shell-') ? -1 : 1))
    .flatMap((d) => [
      path.join(base, d, 'chrome-linux', 'headless_shell'),
      path.join(base, d, 'chrome-linux', 'chrome'),
    ]);
  return candidates.find(existsSync) ?? null;
};

const SYSTEM_PATHS = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

export const browserExecutable = (() => {
  const explicit = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (explicit) {
    if (!existsSync(explicit)) {
      console.warn(`REMOTION_BROWSER_EXECUTABLE=${explicit} does not exist — ignoring it.`);
    } else {
      return explicit;
    }
  }
  return fromPlaywright() ?? SYSTEM_PATHS.find(existsSync) ?? undefined;
})();

if (browserExecutable) console.log('browser:', browserExecutable);
