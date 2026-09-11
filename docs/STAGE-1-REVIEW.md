# Stage 1 review

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
