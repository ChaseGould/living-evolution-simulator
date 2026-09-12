# Stage 1 review

## Pass 1 implementation: foraging and drinking

Implemented on branch `codex/foraging-drinking` in the sibling
`living-evolution-simulator-worktrees/foraging-drinking` directory. Run
`npm run dev -- --port 5174 --strictPort` there and open
http://127.0.0.1:5174/ in desktop Edge for the updated preview.
The main checkout's application code has not been merged with this worktree.

Forage approaches the food site, pauses to search, crouches to collect the prop,
and rises into the existing feeding animation. Drink approaches the pool, lowers
with supporting hand targets, drinks with small jaw motions and water ripples,
then rises. Automatic mode includes both interactions and bounded walks.
The inspector shows each action's phase. Manual interruption exits the current
interaction before beginning the next request; pause freezes it and reset clears it.

Validation: production build and all 11 tests pass. New tests cover ordered phase
completion at three body sizes, stationary interactions, carrying/reset state,
pause and interruption in each phase, and matching automatic results at
30/60/120 updates per second. Browser checks used the in-app WebGPU AMD adapter at
1280 x 720. Inspected drinking from front and side, small-body/large-ear pickup,
and large-body/small-ear drinking with the final supporting hands. The compact
inspector fits the added controls. Observed readings were approximately 44 to
57 FPS across these checks, not a controlled performance comparison.
Current build: 765 files, 7,244,335 bytes raw; Vite still warns about a large bundle.

User acceptance and NVIDIA Edge performance for these actions remain pending.
Turning still uses procedural pivoting, and contact animation remains a prototype.
Food is a reusable presentation prop that reappears after the sequence. The pool
is a simple procedural surface; no resource depletion or biological needs exist.
The next review is Pass 1 action quality before starting Pass 2.

## Current status: expanded Stage 1

The user confirmed completion of the existing visual and NVIDIA Edge review.
That acceptance is recorded in PLAN.md. Stage 1 now remains open for the planned
action expansion: wandering/foraging, drinking, grooming/scratching,
sleeping/waking, alert/startled responses, and social/courtship previews.
Follow Stage 1A in PLAN.md for implementation order and acceptance checks.
Earlier review requests below are historical; the next review concerns the new
actions as they are implemented. Stage 2 waits for expanded action acceptance.

## WebGPU trial: 2026-09-11

Startup now requests a high-performance WebGPU adapter using Babylon's WebGPU
engine, and falls back to WebGL when WebGPU is absent or initialization rejects.
A failed WebGPU initialization replaces its canvas before attempting WebGL,
because one canvas cannot hold both kinds of graphics context. Adapter labels
use the selected engine's reported information, including the WebGPU vendor.
Microsoft Basic Render Driver is now recognized as software rendering.

Production build and eight tests passed. The built scene rendered successfully
in the in-app Chromium browser at 1280 x 720 using WebGPU / AMD / rdna-2, with
roughly 60 to 69 FPS observed. No warning/error entries were returned during the
initial WebGPU rendering check. Habitat image export triggered its success
message. The explicit `?renderer=webgl` path also initialized and reported WebGL
on AMD. Automated checks cover successful GPU startup, rejected GPU startup,
missing WebGPU, failure of both backends, and vendor identification.

The user later added the installed Edge executable in Windows Graphics settings
and explicitly assigned it to the NVIDIA RTX 5060 Laptop GPU. They reported the
preview then showed NVIDIA and improved from about 50 FPS on AMD to about 165
FPS. The in-app browser remains independent and may still show AMD GPU. No code
change can select the discrete GPU on Windows when the browser process itself is
assigned to the integrated adapter; the Windows per-app Edge preference is the
effective configuration.

## User feedback and GPU follow-up: 2026-09-11

The user likes the dark style, trait adjustments, camera, and smooth preview,
but wants higher fidelity and substantially more convincing animation. Eating
does not yet read as eating. Stay in stage 1 and improve the asset/animation
before starting the biological simulation.

Windows now has the installed Microsoft Edge executable configured with the
per-application high-performance GPU preference. Standalone Edge rendering on
NVIDIA has not yet been verified: the browser connector only exposed the in-app
browser, and automatic policy review blocked the CLI browser test launch.
The preview now displays the actual renderer vendor next to FPS. Open it in Edge
and look for NVIDIA GPU; hover the label for the full renderer string. The in-app
browser's GPU selection is independent and may still show AMD GPU. This label
reports observed renderer information, not the configured Windows preference.

Date: 2026-09-10. Status: implemented visual prototype; user acceptance pending.

## Implemented

- Dark woodland scene, procedural creature, soft sky fill and directional lighting,
  shadows, tone mapping, orbit/zoom/follow camera, and specimen inspection panel.
- Breathing, blinking, looking, walking, resting, and eating preview poses.
  Distance-driven gait with analytic two-bone leg placement; blended transitions.
- Body scale 0.80x to 1.20x, ear length scale 0.70x to 1.30x, and slate-to-umber
  coloration. Uniform body scaling preserves relative anatomy. Ear bases stay
  attached to the head. This does not prove arbitrary limb-length deformation.
- Pause/resume, Space shortcut, reset, manual/automatic poses, and image export.
- Locally bundled fonts and generated textures; no network asset dependencies.

## Validation

`npm run build` passes TypeScript and Vite compilation. `npm test` passes four
checks: pause invariance, bounded walking with destination completion across
body sizes, persistent manual poses, and reset after moving/pausing.

Browser: Codex in-app Chromium, WebGL 2 through ANGLE / Direct3D11.
Machine: AMD Ryzen 7 8745HX, AMD Radeon 610M, and NVIDIA RTX 5060 Laptop GPU.
The browser actually selected the AMD Radeon 610M integrated GPU.
Observed render buffer: 1440 x 1106. A desktop viewport override was requested;
the buffer dimensions above are the actual diagnostic reading.

After switching to 1024px PCF shadows, observed instantaneous frame rates were
about 55 to 65 FPS in the reviewed poses. A resting maximum-body/minimum-ear
sample reported 54.85 FPS and a 600-frame rolling mean of 16.49 ms. A paused
minimum-body sample reported 61.95 FPS and a rolling mean of 16.00 ms. These are
live browser observations, not guaranteed minimums or a cross-device benchmark.
Earlier more expensive shadow settings ran at roughly 25 to 42 FPS on this GPU.
Scene contains 258 meshes and approximately 500,193 vertices. Static fern meshes
are batched; further geometry/asset optimization remains possible.

Checked maximum/maximal, minimum/minimal, and mixed body/ear endpoints, both color
endpoints, resting eyelids, held-food pose, and walking. Orbit and zoom changed the
camera while pause held time and position exactly at the recorded values.
Reset restored all three sliders, camera following, and initial position.
Space resumed playback. No browser warning/error entries were returned during
the final control check. A narrow layout was also inspected before desktop QA.

## Limits and required review

This is a procedural character proof, not final high-definition realistic creature
art. Some joints remain visibly assembled, and the woodland backdrop is simple.
The skin and silhouette should be judged against the user's desired realism.
Foot placement improves stance but turning and entering/leaving a walk are not
production-quality contact animation. Eating is a held-food animation preview,
not an interaction with simulated resources. Rest is a crouched/drowsing pose.

The main Babylon bundle is large. Build output sizes are recorded below; they
measure local build files, not actual network requests. No biological simulation,
save system, high-speed evolution, or hosting has been added.

The next decision is user visual acceptance. Do not begin stage 2 merely because
the code compiles; if the creature is too stylized, use a dedicated sculpt/rig.

## Build size

Final build: 86 files, 7,053,256 bytes raw (6.73 MiB), and 1,671,978 bytes
(1.59 MiB) when each output file is gzip-compressed for estimation. This includes
lazy engine chunks, font fallbacks, and third-party license notices.

## Readability and motion revision

User clarified that dark means atmosphere, with the creature still easy to inspect.
Raised sky and ground fill, reduced fog and contrast, softened the screen vignette,
and increased shadow resolution. Skin pigment is more readable with subtler bump;
added ground leaf litter. Kept the dusk woodland palette.

Eating now uses a timed lift/bite/chew/lower sequence, two-segment arm targeting,
finger curl, an articulated lower lip, oral cavity, and lateral chewing motion.
Idle gaze settles toward attention targets; breathing expands the chest; walking
adds weight shifts, and rest lowers the body with feet compensated by leg IK.
This remains procedural prototype art, not an authored production sculpt/rig.
Food is a looping presentation prop, not a simulated consumed resource.

Validation: TypeScript/build and eight existing tests pass. Inspected the browser
preview for lighting, eating, rest, and combined trait extremes. Browser review
uses the embedded AMD renderer, not the user's separately configured NVIDIA Edge.
The user reported NVIDIA at 165 FPS before this visual revision. New NVIDIA
performance and subjective animation acceptance remain to be reviewed.

## New-session continuation

Repository: `C:\the_lab\web-projects\living-evolution-simulator`.

Begin with Stage 1A, Pass 1 in PLAN.md. For visual review, run `npm run dev` from
that directory, then open `http://127.0.0.1:5173/` in the
desktop Edge installation configured for NVIDIA. The preview's top-right label
should identify NVIDIA. Review the brighter dusk scene and all five behavior
buttons, with special attention to whether the food reaches the mouth and the
chewing reads as intentional. Capture the user's judgment before starting Stage
2. If another pass is requested, continue improving the original procedural
asset; do not call it a production rig or begin biological simulation.
