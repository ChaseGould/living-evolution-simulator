# Living Evolution Simulator

## Status and agreed direction

Stage 1 has a working local visual prototype, pending the user's visual acceptance.
No biological simulation or hosting has been implemented. See docs/STAGE-1-REVIEW.md
for measured performance, checks, known art limitations, and the current review
request. A new session should read both documents, run the local preview, and
collect visual feedback before beginning Stage 2.
Build a desktop-browser-first observation sandbox in which expressive 3D creatures
are the focus. Use TypeScript and Babylon.js, subject to the first visual and
performance checkpoint. Develop locally. Prefer Cloudflare when sharing becomes
necessary; initially host static game files on Cloudflare Pages with no backend.
Browser Web Workers execute on the player's computer and are unrelated to
Cloudflare Workers. Closing the browser stops local simulation.

## Product priorities

1. A detailed creature that feels alive at close range.
2. Visible, inherited variation that survives animation without broken anatomy.
3. Fast evolution independent of rendering.
4. Species definitions that do not bake gremlin anatomy into the common engine.

The experience centers on orbiting, zooming, following, and inspecting creatures.
Evolution results from inheritance, mutation, finite resources, survival, and
reproduction. Do not directly reward a target appearance or randomly replace
bodies and call it evolution.

## Smallest useful prototype

One gremlin species, one small habitat, a bounded population, and three visible
traits: overall size, ear size, and coloration. Start with a deliberately bounded
trait range and simple normalized numeric genes. Some traits can initially be
neutral; do not invent survival benefits just to make every slider adaptive.
Size affects energy demand and a documented survival/reproduction tradeoff.

Creature actions: breathing, blinking, looking around, walking, resting, and eating.
Controls: orbit, zoom, follow, select, pause, resume, reset, step, and requested speed.
Inspector: ID, species, age, parents, genome, energy, and generation depth.
With overlapping generations, display time and population statistics separately
from ancestry depth; there is no single universal population generation counter.

## Architecture

Keep these conceptual boundaries; do not scaffold empty packages in advance:

- Simulation core: plain TypeScript with no Babylon, DOM, or animation dependency.
  Owns seeded randomness, clock, resources, individuals, inheritance, births,
  deaths, and abstract functional traits. Starts with a bounded numeric genome;
  complex chromosomes and sexual genetics are deferred.
- Species definitions: stable ID and version, gene bounds/defaults/mutation rules,
  genome-to-functional-trait mapping, behaviors, and a separate visual adapter.
  The shared engine must not know about ears, tails, or a gremlin skeleton.
- Browser worker: advances the same simulation rules in batches and publishes
  bounded snapshots and statistics. Commands include pause, reset, and step.
- Renderer: consumes snapshots, interpolates positions, blends animation, and
  applies visual traits. Cosmetic blinking and grooming cannot determine survival.
- UI and persistence: controls and inspection outside the simulation; versioned
  saves, exported checkpoints, and selected historical specimens.

Use a fixed simulation timestep initially and benchmark before optimizing.
Skipping rendering must not silently change biological rules. Larger time steps
or event-based approximations require validation against the reference model.
Do not promise 10,000x. Report achieved simulated time per real second alongside
requested speed, population size, hardware, and simulation settings.
Keep snapshot frequency independent of simulation frequency. Bound work batches
so pause/reset remain responsive. Benchmark the core without a browser too.

## Creature asset contract

Each species package supplies a model (prefer GLB/glTF), textures, skeleton,
animation clips, gene schema, phenotype mappings, behavior configuration, and
asset license/provenance. Record package versions in saves and ancestor records.

Use a properly authored rig and morph targets, with named animation actions.
Use morph targets for designed shape changes, bone transforms where appropriate,
and material parameters for color. Test combined trait extremes, not just each
gene individually. Validate feet, joints, eyes, and mouth during animation.
Do not assume arbitrary new skeletons can reuse gremlin animations.

Start with good lighting, materials, expressive eyes, and bounded anatomical
variation. Elaborate fur, drastic limb changes, new appendages, and changing body
topology are deferred. The first source asset is an original procedural sculpt
and articulated node hierarchy, with the user's chosen dark, realistic direction.
It is a reviewable prototype, not a production-quality rigged GLB. No asset
purchases or placeholder art should be represented as final creature quality.

## Persistence and history

Initially support a versioned local save and export/import. Plan browser storage
for larger saves after measuring their size. Store seed, RNG state, simulation
time, environment, individuals, genomes, and species/schema versions so resuming
is meaningful. Keep bounded aggregate history and selected ancestor snapshots,
not every frame or every individual forever. Ancestor appearance reconstruction
requires the corresponding asset and mapping version. Full family trees,
retention policies for very long runs, and cloud synchronization come later.

## Implementation checkpoints

### 1. Visual and deformation proof

- [x] Choose an initial asset source, art direction, and target desktop hardware/browser.
- [x] Render a procedural creature in a small lit habitat with orbit/zoom controls.
- [x] Add idle, look, walk, rest, and eat preview behavior with blended transitions.
- [x] Demonstrate size, ear, and color variation on the animated creature.
- [x] Inspect combined trait extremes and improve foot placement with two-bone IK.
- [x] Record frame rate and build size on the target machine.
- [ ] User reviews and accepts creature quality, movement, and the dark visual direction.
- [ ] If needed after review, replace the procedural prototype with a dedicated sculpt and rig.

Implementation includes original continuous head/torso surfaces, procedural skin
textures, articulated limbs, gaze/blinks/breathing, a lit woodland habitat, and a
responsive inspection UI. Behavioral previews are not survival or inheritance.
See docs/ASSETS.md for provenance. No claim of photorealism or final asset quality.

Exit: the user accepts the creature's appearance and animation quality. Revisit
asset pipeline or platform if this fails before expanding the game.

### Current continuation point

The procedural Vesper prototype has received a readability and motion pass. The
woodland remains dusk-toned, while increased fill light, reduced fog, softer
vignetting, and refined skin make the specimen readable. Feeding now has a
coordinated lift, bite, chew, and lower loop; walking, breathing, idle gaze, and
resting were also refined. This is presentation behavior, not simulation.

Start a new work session by reading this plan and `docs/STAGE-1-REVIEW.md`, then
run `npm run dev` from the repository root and open `http://127.0.0.1:5173/` in
the desktop Edge installation configured for NVIDIA. Review lighting, animation,
and performance with the user. Do not start Stage 2 until they accept the visual
prototype or explicitly direct another art/animation pass.

### 2. Early simulation and acceleration proof

- [ ] Implement seeded inheritance, bounded mutation, resources, births, and deaths.
- [ ] Define the size/energy tradeoff and a reproducible environment experiment.
- [ ] Run the same core headlessly and in a browser worker.
- [ ] Verify same-seed reproducibility, gene bounds, and save/resume continuity.
- [ ] Verify batch size/render frequency do not change simulation outcomes.
- [ ] Compare trait distributions across repeated seeds and a control environment.
- [ ] Benchmark throughput and memory across increasing population sizes.

Exit: measured acceleration and a defensible selection effect. Extinction is a
valid result; do not conceal it with undocumented automatic population resets.

### 3. Integrated playable experiment

- [ ] Connect worker snapshots to creatures, controls, and inspection.
- [ ] Show inherited visual differences between parents and offspring.
- [ ] Add local save/export/import and a bounded ancestor comparison.
- [ ] Verify responsive pause/reset and measured speed under acceleration.
- [ ] Validate species boundaries using a minimal alternate test definition.

Exit: observe a creature, change an environment variable, accelerate, and inspect
inherited differences in descendants without switching biological models.

### 4. Share when requested

- [ ] Build static browser files and verify them locally.
- [ ] Configure Cloudflare Pages and GitHub Actions deployment when needed.
- [ ] Exclude documentation-only changes from deployment triggers.
- [ ] Check shared URLs contain no personal name or email handle.

No hosting or deployment is required for the planning or local prototype stages.

## Deferred features

Multiple coexisting species, predators, several biomes, advanced fur, unrestricted
body evolution, large lineage trees, AI scientist, cloud saves, accounts,
multiplayer, and simulation that continues after the browser closes.
AI explanations must eventually distinguish correlations from causal evidence.
Do not add a server or rewrite the core in another language without measurement.

## References

- Original concept: docs/original-concept.md.
- Babylon.js capabilities: https://www.babylonjs.com/specifications/
- Browser workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

## Decisions still open

User visual acceptance and whether a dedicated production sculpt is needed;
precise biological tradeoff equations and population cap. Resolve these at their
checkpoint, without implementing the entire eventual ecosystem first.
