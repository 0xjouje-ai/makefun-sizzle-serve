// Sizzle & Serve — the entry program (Node 22, standard library only).
// The game itself is plain static files under game/ (game/index.html plus its
// scripts, no build step, nothing loaded over the network), and this program
// hands it in: it copies game/ and screenshots/ from beside this file into
// /output and writes /output/dossier.json with the kit's vendored library.
//
// Run it locally the same way the grader does:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.)
// Play the game first with any static server, e.g.:
//   python3 -m http.server --directory game 8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps the gate enforces: at most 4 screenshots of 256 KiB, game/ at most
// 993 files and 48 MiB, no path under game/ over 1000 bytes, dossier text at
// most 160 KiB. The game is far inside every one of them (9 source files,
// 4 screenshots), so the dossier carries the whole source for the judge.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
