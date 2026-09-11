# Living Evolution Simulator

A desktop-browser-first evolution sandbox centered on expressive 3D creatures.

Stage 1 is a working local visual prototype, pending visual acceptance. Start with [PLAN.md](PLAN.md).
Agent instructions are in [AGENTS.md](AGENTS.md). The original concept is preserved
in [docs/original-concept.md](docs/original-concept.md).

Implemented stack: TypeScript, Babylon.js, and Vite. Browser Web Workers belong to
the next simulation stage. Use Cloudflare hosting when sharing is needed.

Rendering now tries WebGPU with a high-performance adapter preference first.
If WebGPU is unavailable or fails initialization, startup falls back to WebGL.
The label next to FPS shows the actual backend and adapter vendor; the preference
does not guarantee NVIDIA selection. Hover it for the available adapter details.
For manual compatibility testing, add `?renderer=webgl` to the preview URL.

## Run locally

Requires Node.js 24 or newer. From this project, run `npm ci` once, then `npm run dev`.
Open the localhost URL printed by Vite. `npm run build` checks TypeScript and builds
static files; `npm run preview` serves that build. `npm test` runs behavior checks.
`node scripts/measure-build.mjs` reports total output size after a build.

Drag to orbit, scroll to zoom, and press Space to pause/resume. Select a behavior
to hold it, or Autonomous for the preview sequence. Adjust body size, ear size,
and skin coloration while watching the creature. Reset restores the initial
traits, camera, and behavior. The camera button downloads the habitat as a PNG.

All assets, textures, and fonts run locally after dependencies are installed.
There are no remote asset URLs, accounts, analytics, backend, or evolution engine.
The creature is an original procedural art prototype, not a finished realistic
character asset. See [review notes](docs/STAGE-1-REVIEW.md) and [asset provenance](docs/ASSETS.md).
