# Living Evolution Simulator: agent instructions

This is an independent game project, unrelated to Elite Security Specialists.
Read PLAN.md before making changes. It owns agreed scope, decisions, checkpoints,
and current progress. Update completed checklist items as the work is completed.
The original user concept is preserved in docs/original-concept.md; PLAN.md records
the incremental implementation strategy agreed afterward.

## Working rules

- Prioritize creature quality, visible inherited variation, and measured simulation
  throughput. Do not build the whole ecosystem before proving these risks.
- Use TypeScript and Babylon.js for the initial desktop browser prototype.
- Keep the simulation independent of Babylon, browser APIs, and visual anatomy.
- Run browser computation in a Web Worker. Cloudflare Workers are a separate,
  optional server technology, not required to run local evolution.
- Species own their genes, functional mappings, visual mappings, assets, and
  animation conventions. Never hardcode gremlin anatomy in the shared engine.
- Seed simulation randomness; retain the same biological rules across speeds.
  Measure achieved acceleration instead of promising a 10,000x speed setting.
- Treat genome bounds, animation deformation, reproducibility, resource accounting,
  and save/resume continuity as meaningful validation targets.
- Record licenses for third-party assets. Do not commit secrets, generated builds,
  dependency directories, local simulation saves, or large unreviewed source art.
- Use Cloudflare for hosting when needed. Begin locally without a backend.
  Prefer Pages for shared static builds. Do not deploy documentation-only changes.
- Do not add AI, cloud persistence, multiplayer, or additional species gameplay
  before the prototype checkpoints justify them.
- Work on code changes in dedicated sibling Git worktrees, following ancestor
  instructions. Documentation-only setup does not require application scaffolding.
- Keep reporting concise. State what exists, what was verified, and what remains.

AGENTS.md and CLAUDE.md contain the same instructions. Keep them synchronized.

## Local development

Node.js 24 or newer is required. Install with npm ci. Use npm run dev for
the local preview, npm run build for type checking and static output, and
npm test for behavior checks. docs/STAGE-1-REVIEW.md records validation and
art limitations. Stage 1 still requires user visual acceptance before stage 2.
