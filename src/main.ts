import "./style.css";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  HemisphericLight,
  ImageProcessingConfiguration,
  Scene,
  ShadowGenerator,
  Vector3,
} from "@babylonjs/core";
import { CreateScreenshotAsync } from "@babylonjs/core/Misc/screenshotTools";
import { createRenderer, type Renderer } from "./renderer";
import { rendererVendor } from "./renderer-policy";
import { vesper } from "./species/vesper";
import { createHabitat } from "./visual/habitat";
import { PreviewDirector } from "./preview";
import type { Action, Traits } from "./types";

const icon = (name: string) =>
  ({
    focus:
      '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="4"/>',
    reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    leaf: '<path d="M20 3C7 1 0 12 7 18S22 15 20 3Z M5 21 16 9"/>',
    camera:
      '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="m8 6 2-3h4l2 3"/>',
  })[name] ?? "";
const svg = (name: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icon(name)}</svg>`;
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <canvas id="habitat" aria-label="Interactive 3D habitat. Drag to orbit, scroll to zoom." tabindex="0"></canvas>
  <div class="vignette"></div>
  <header class="topbar">
    <a class="wordmark" href="./" aria-label="Living Evolution home"><span class="brand-mark">${svg("leaf")}</span><span>LIVING EVOLUTION<small>A FIELD STUDY IN POSSIBILITY</small></span></a>
    <div class="chapter"><span class="status-dot"></span> OBSERVATION 001 <span class="divider">/</span> VISUAL PROTOTYPE</div>
    <button class="icon-button" id="capture" title="Save habitat image" aria-label="Save habitat image">${svg("camera")}</button>
  </header>
  <main>
    <section class="intro"><div class="eyebrow">THE FIRST SPECIMEN</div><h1>Meet Vesper<span>.</span></h1><p>A quiet presence in the undergrowth.<br>Watch closely. There is life in the details.</p><div class="specimen-id"><span>01</span> VESPER GREMLIN <i></i> FOUNDER</div></section>
    <aside class="inspector" aria-label="Creature inspector">
      <div class="panel-top"><span class="eyebrow">SPECIMEN PROFILE</span><span class="tiny-tag">LIVE</span></div>
      <div class="profile-title"><h2>Vesper</h2><span>VG-001</span></div>
      <div class="state-row"><span class="status-dot"></span><strong id="action-status">Observing</strong><span id="elapsed">00:00</span></div>
      <div class="section-label">VISIBLE TRAITS <span>03</span></div>
      <div class="trait"><label for="size">Body size <output id="size-value">1.00x</output></label><input id="size" type="range" min="0" max="100" value="50"><div class="range-labels"><span>SMALLER</span><span>LARGER</span></div></div>
      <div class="trait"><label for="ears">Ear size <output id="ears-value">1.00x</output></label><input id="ears" type="range" min="0" max="100" value="50"><div class="range-labels"><span>COMPACT</span><span>ELONGATED</span></div></div>
      <div class="trait"><label for="color">Skin coloration <output id="color-value">36%</output></label><input id="color" class="color-range" type="range" min="0" max="100" value="36"><div class="range-labels"><span>SLATE</span><span>UMBER</span></div></div>
      <div class="section-label behavior-label">BEHAVIOR <span>PREVIEW</span></div>
      <div class="behaviors" role="group" aria-label="Preview behavior"><button data-action="auto" class="selected" aria-pressed="true">Autonomous</button><button data-action="observe" aria-pressed="false">Observe</button><button data-action="walk" aria-pressed="false">Walk</button><button data-action="rest" aria-pressed="false">Rest</button><button data-action="eat" aria-pressed="false">Eat</button></div>
      <p class="preview-note">Appearance study. Traits are adjustable here;<br>inheritance begins in the next stage.</p>
    </aside>
    <section class="environment-label"><span class="eyebrow">HABITAT 01</span><h3>The shaded hollow</h3><p>Temperate woodland <span>/</span> Dusk</p></section>
    <div id="loading" role="status"><span class="status-dot"></span> Entering the hollow...</div>
  </main>
  <footer class="bottom-bar"><div class="transport"><button id="pause" class="round-button" aria-label="Pause animation">${svg("pause")}</button><div><strong id="playback">Live observation</strong><span>REAL TIME <i></i> 1x</span></div><button id="reset" class="icon-button" title="Reset specimen" aria-label="Reset specimen">${svg("reset")}</button></div><div class="camera-hints"><span>DRAG <b>Orbit</b></span><span>SCROLL <b>Zoom</b></span><span>SPACE <b>Pause</b></span></div><button class="follow-button active" id="follow" aria-pressed="true">${svg("focus")}<span>Following specimen</span></button></footer>
  <div class="performance"><span class="status-dot"></span><span id="fps">Measuring</span><span id="gpu-label">DETECTING GPU</span></div>
  <div class="toast" id="toast" role="status"></div>
`;

let selectedRenderer: Renderer;
try {
  selectedRenderer = await createRenderer(
    document.querySelector<HTMLCanvasElement>("#habitat")!,
    new URLSearchParams(location.search).get("renderer") === "webgl",
  );
} catch {
  document.querySelector("#loading")!.innerHTML =
    'The graphics engine could not start. Enable graphics acceleration or <a href="?renderer=webgl">try compatibility mode</a>.';
  throw new Error("Neither graphics backend could initialize");
}
const { engine, canvas, backend, info: rendererInfo } = selectedRenderer;
const renderer = [
  backend,
  rendererInfo.vendor,
  rendererInfo.renderer,
  rendererInfo.version,
].join(" / ");
const gpuLabel = document.querySelector<HTMLElement>("#gpu-label")!;
gpuLabel.textContent = `${backend} · ${rendererVendor(rendererInfo)}`;
gpuLabel.title =
  renderer +
  (selectedRenderer.fallbackReason
    ? `\n${selectedRenderer.fallbackReason}`
    : "");
gpuLabel.setAttribute("aria-label", `Active renderer: ${renderer}`);
engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
const scene = new Scene(engine);
scene.clearColor = new Color4(0.047, 0.063, 0.055, 1);
scene.fogMode = Scene.FOGMODE_EXP2;
scene.fogDensity = 0.065;
scene.fogColor = new Color3(0.047, 0.063, 0.055);
scene.ambientColor = new Color3(0.22, 0.25, 0.21);
const camera = new ArcRotateCamera(
  "observation-camera",
  1.13,
  1.28,
  5.6,
  new Vector3(0, 1.08, 0),
  scene,
);
camera.lowerRadiusLimit = 2.4;
camera.upperRadiusLimit = 11;
camera.lowerBetaLimit = 0.35;
camera.upperBetaLimit = 1.5;
camera.wheelDeltaPercentage = 0.012;
camera.pinchDeltaPercentage = 0.01;
camera.minZ = 0.05;
camera.panningSensibility = 0;
camera.attachControl(canvas, true);
const fill = new HemisphericLight("sky-fill", new Vector3(0, 1, 0), scene);
fill.intensity = 1.5;
fill.diffuse = new Color3(0.69, 0.77, 0.79);
fill.groundColor = new Color3(0.32, 0.35, 0.28);
const key = new DirectionalLight(
  "canopy-opening",
  new Vector3(-0.4, -1, -0.65),
  scene,
);
key.position.set(3, 7, 5);
key.intensity = 3.4;
key.diffuse = new Color3(1, 0.89, 0.71);
const rim = new DirectionalLight(
  "blue-hour-rim",
  new Vector3(0.6, -0.4, 0.7),
  scene,
);
rim.position.set(-3, 4, -4);
rim.intensity = 1.65;
rim.diffuse = new Color3(0.51, 0.67, 0.72);
const shadows = new ShadowGenerator(2048, key);
shadows.usePercentageCloserFiltering = true;
shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
shadows.bias = 0.0005;
shadows.normalBias = 0.025;
key.shadowMinZ = 1;
key.shadowMaxZ = 18;
createHabitat(scene, shadows);
const creature = vesper.createVisual(scene);
creature.meshes.forEach((m) => {
  shadows.addShadowCaster(m);
  m.receiveShadows = true;
});
const pipeline = new DefaultRenderingPipeline(
  "observation-grade",
  true,
  scene,
  [camera],
);
pipeline.fxaaEnabled = true;
pipeline.samples = 1;
pipeline.imageProcessing.toneMappingEnabled = true;
pipeline.imageProcessing.toneMappingType =
  ImageProcessingConfiguration.TONEMAPPING_ACES;
pipeline.imageProcessing.exposure = 1.5;
pipeline.imageProcessing.contrast = 1.02;
const director = new PreviewDirector();
const traits: Traits = { ...vesper.defaultTraits };
let following = true,
  lastUi = 0,
  frameCount = 0;
const frameTimes: number[] = [];
const diagnostics = document.createElement("output");
diagnostics.id = "qa-metrics";
diagnostics.hidden = true;
document.body.append(diagnostics);
const actionNames = {
  observe: "Observing",
  walk: "Exploring",
  rest: "Resting",
  eat: "Eating",
};
function updateTraits() {
  for (const name of ["size", "ears", "color"] as const) {
    const input = document.querySelector<HTMLInputElement>(`#${name}`)!;
    traits[name] = Number(input.value) / 100;
    input.style.setProperty("--value", `${input.value}%`);
  }
  document.querySelector("#size-value")!.textContent =
    `${(0.8 + traits.size * 0.4).toFixed(2)}x`;
  document.querySelector("#ears-value")!.textContent =
    `${(0.7 + traits.ears * 0.6).toFixed(2)}x`;
  document.querySelector("#color-value")!.textContent =
    `${Math.round(traits.color * 100)}%`;
  creature.setTraits(traits);
}
document
  .querySelectorAll<HTMLInputElement>("input[type=range]")
  .forEach((input) => input.addEventListener("input", updateTraits));
updateTraits();
function syncBehavior() {
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((b) => {
    const selected =
      b.dataset.action === (director.automatic ? "auto" : director.action);
    b.classList.toggle("selected", selected);
    b.setAttribute("aria-pressed", String(selected));
  });
}
document
  .querySelectorAll<HTMLButtonElement>("[data-action]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.action === "auto") director.setAction("observe", true);
      else director.setAction(button.dataset.action as Action);
      syncBehavior();
    }),
  );
function syncPause() {
  document.querySelector("#pause")!.innerHTML = svg(
    director.paused ? "play" : "pause",
  );
  document
    .querySelector("#pause")!
    .setAttribute(
      "aria-label",
      director.paused ? "Resume animation" : "Pause animation",
    );
  document.querySelector("#playback")!.textContent = director.paused
    ? "Observation paused"
    : "Live observation";
}
function togglePause() {
  director.paused = !director.paused;
  syncPause();
}
document.querySelector("#pause")!.addEventListener("click", togglePause);
window.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    !(e.target instanceof HTMLInputElement) &&
    !(e.target instanceof HTMLButtonElement)
  ) {
    e.preventDefault();
    togglePause();
  }
});
document.querySelector("#reset")!.addEventListener("click", () => {
  director.reset();
  for (const name of ["size", "ears", "color"] as const)
    document.querySelector<HTMLInputElement>(`#${name}`)!.value = String(
      vesper.defaultTraits[name] * 100,
    );
  updateTraits();
  syncPause();
  syncBehavior();
  camera.alpha = 1.13;
  camera.beta = 1.28;
  camera.radius = 5.6;
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  following = true;
  syncFollow();
  camera.target.set(0, 1.08, 0);
});
function syncFollow() {
  const b = document.querySelector("#follow")!;
  b.classList.toggle("active", following);
  b.setAttribute("aria-pressed", String(following));
  b.querySelector("span")!.textContent = following
    ? "Following specimen"
    : "Camera anchored";
}
document.querySelector("#follow")!.addEventListener("click", () => {
  following = !following;
  syncFollow();
});
let toastTimer = 0;
function toast(message: string) {
  const el = document.querySelector("#toast")!;
  el.textContent = message;
  el.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("visible"), 2500);
}
document.querySelector("#capture")!.addEventListener("click", async () => {
  try {
    const a = document.createElement("a");
    a.download = "vesper-habitat.png";
    a.href = await CreateScreenshotAsync(engine, camera, {
      width: engine.getRenderWidth(),
      height: engine.getRenderHeight(),
    });
    a.click();
    toast("Habitat image saved");
  } catch {
    toast(
      "Could not capture the habitat. Try again after it finishes loading.",
    );
  }
});
scene.onPointerPick = (_event, pick) => {
  if (pick.pickedMesh && creature.meshes.includes(pick.pickedMesh)) {
    following = true;
    syncFollow();
    toast("Following Vesper");
  }
};

engine.runRenderLoop(() => {
  const rawDelta = engine.getDeltaTime();
  const delta = Math.min(0.05, rawDelta / 1000);
  const pose = director.tick(delta, traits.size);
  creature.update(pose);
  if (following) {
    const target = new Vector3(
      director.x,
      1.08 * (0.8 + traits.size * 0.4),
      director.z,
    );
    camera.target.copyFrom(
      Vector3.Lerp(camera.target, target, 1 - Math.exp(-delta * 5)),
    );
  }
  scene.render();
  frameCount++;
  if (frameCount > 90) {
    frameTimes.push(rawDelta);
    if (frameTimes.length > 600) frameTimes.shift();
  }
  if (performance.now() - lastUi > 300) {
    lastUi = performance.now();
    document.querySelector("#action-status")!.textContent = director.paused
      ? "Paused"
      : actionNames[director.action];
    document.querySelector("#elapsed")!.textContent = `${Math.floor(
      director.time / 60,
    )
      .toString()
      .padStart(2, "0")}:${Math.floor(director.time % 60)
      .toString()
      .padStart(2, "0")}`;
    const fps = engine.getFps();
    document.querySelector("#fps")!.textContent =
      Number.isFinite(fps) && frameCount > 30
        ? `${Math.round(fps)} FPS`
        : "Measuring";
    diagnostics.textContent = JSON.stringify({
      fps,
      averageFrameMs:
        frameTimes.reduce((a, b) => a + b, 0) / Math.max(1, frameTimes.length),
      samples: frameTimes.length,
      meshes: scene.meshes.length,
      vertices: scene.getTotalVertices(),
      renderWidth: engine.getRenderWidth(),
      renderHeight: engine.getRenderHeight(),
      gpu: rendererInfo,
      backend,
      fallbackReason: selectedRenderer.fallbackReason,
      time: director.time,
      action: director.action,
      traits,
      x: director.x,
      z: director.z,
      camera: { alpha: camera.alpha, beta: camera.beta, radius: camera.radius },
      paused: director.paused,
      following,
    });
    syncBehavior();
  }
});
scene.executeWhenReady(() =>
  document.querySelector("#loading")!.classList.add("loaded"),
);
window.addEventListener("resize", () => engine.resize());
