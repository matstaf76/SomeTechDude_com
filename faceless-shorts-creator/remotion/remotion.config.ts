import { Config } from '@remotion/cli/config';
import { browserExecutable } from './scripts/browser.mjs';

// ../media is Remotion's public root: staticFile('library/logos/x') →
// ../media/library/x (reusable), staticFile('projects/<proj>/x') → ../media/projects/... (per-video).
Config.setPublicDir('../media');

// Only applies to the CLI (studio/`remotion render`); the programmatic scripts in scripts/
// pass browserExecutable themselves. Undefined = let Remotion download its own browser.
if (browserExecutable) Config.setBrowserExecutable(browserExecutable);

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto
