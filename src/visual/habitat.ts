import {
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  TransformNode,
  Vector3,
  VertexBuffer,
} from "@babylonjs/core";
import {
  albedoTexture,
  ellipsoid,
  material,
  random,
  skinTexture,
  tube,
} from "./geometry";
import { previewSites } from "../preview";
import type { CreaturePose } from "../types";

export function createHabitat(scene: Scene, shadows: ShadowGenerator) {
  const rng = random(814);
  const soil = material(scene, "peat-and-stone", "#292d26", 0.99);
  const soilColor = albedoTexture(scene);
  soilColor.uScale = 95;
  soilColor.vScale = 95;
  soil.albedoTexture = soilColor;
  const soilBump = skinTexture(scene);
  soilBump.uScale = 90;
  soilBump.vScale = 90;
  soilBump.level = 0.7;
  soil.bumpTexture = soilBump;
  const rock = material(scene, "wet-basalt", "#363c37", 0.86);
  rock.albedoTexture = albedoTexture(scene);
  rock.bumpTexture = skinTexture(scene);
  rock.bumpTexture.level = 0.8;
  const moss = material(scene, "forest-moss", "#3e4b30", 1);
  const stem = material(scene, "undergrowth-stems", "#394535", 0.95);
  const leaf = material(scene, "fern-leaves", "#354936", 0.84);
  leaf.backFaceCulling = false;
  const bark = material(scene, "old-wood", "#303029", 0.96);
  bark.albedoTexture = albedoTexture(scene);
  const barkBump = skinTexture(scene);
  barkBump.uScale = 9;
  barkBump.vScale = 0.7;
  barkBump.level = 0.8;
  bark.bumpTexture = barkBump;
  const food = material(scene, "mushroom-cap", "#948165", 0.82);
  const floor = MeshBuilder.CreateGround(
    "forest-floor",
    { width: 200, height: 200 },
    scene,
  );
  floor.material = soil;
  floor.receiveShadows = true;
  const staticMeshes: Mesh[] = [floor];
  for (let i = 0; i < 95; i++) {
    const a = rng() * Math.PI * 2,
      r = 2.0 + rng() * 2.8,
      size = 0.045 + rng() ** 2 * 0.44;
    const m = ellipsoid(
      scene,
      "stone",
      [Math.cos(a) * r, size * 0.3 - 0.005, Math.sin(a) * r],
      [size * 1.3, size * 0.7, size],
      i % 3 ? rock : moss,
      undefined,
      7,
    );
    const vertices = m.getVerticesData(VertexBuffer.PositionKind)!;
    for (let v = 0; v < vertices.length; v += 3) {
      const factor =
        1 +
        0.12 *
          Math.sin(vertices[v] * 8 + vertices[v + 1] * 6 + vertices[v + 2] * 3);
      vertices[v] *= factor;
      vertices[v + 1] *= factor;
      vertices[v + 2] *= factor;
    }
    m.setVerticesData(VertexBuffer.PositionKind, vertices);
    m.rotation.set(rng(), rng() * 6, rng() * 0.3);
    m.receiveShadows = true;
    shadows.addShadowCaster(m);
    staticMeshes.push(m);
  }
  function fern(x: number, z: number, scale: number) {
    const base = new TransformNode("fern", scene);
    base.position.set(x, 0.06, z);
    base.scaling.setAll(scale);
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2 + rng() * 0.25,
        len = 0.5 + rng() * 0.35;
      const path = Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        return new Vector3(
          Math.cos(a) * len * t,
          Math.sin(t * Math.PI * 0.83) * 0.42 + 0.02,
          Math.sin(a) * len * t,
        );
      });
      const branch = tube(
        scene,
        "fern-stem",
        path,
        path.map((_, i) => 0.009 * (1 - i / 10)),
        stem,
        base,
        5,
      );
      staticMeshes.push(branch);
      for (let k = 1; k < 8; k++)
        for (const side of [-1, 1]) {
          const p = path[k],
            length = 0.17 * Math.sin((k / 9) * Math.PI);
          const leaflet = MeshBuilder.CreateDisc(
            "fern-pinna",
            { radius: 1, tessellation: 7, sideOrientation: Mesh.DOUBLESIDE },
            scene,
          );
          leaflet.parent = base;
          leaflet.position.copyFrom(p);
          leaflet.rotation.set(Math.PI / 2 - 0.25, a + side * 0.8, 0);
          leaflet.scaling.set(length, length * 0.2, 1);
          leaflet.position.x += Math.cos(a + side * 1.0) * length * 0.7;
          leaflet.position.z += Math.sin(a + side * 1.0) * length * 0.7;
          leaflet.material = leaf;
          staticMeshes.push(leaflet);
        }
    }
  }
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    fern(
      Math.cos(a) * (2.7 + rng()),
      Math.sin(a) * (2.7 + rng()),
      0.7 + rng() * 0.8,
    );
  }
  // A fine layer of fallen leaves gives the clearing a readable ground scale.
  const litter = material(scene, "fallen-leaves", "#635641", 0.96);
  const leafParts: Mesh[] = [];
  for (let i = 0; i < 130; i++) {
    const a = rng() * Math.PI * 2,
      r = 0.5 + rng() * 5;
    const fallen = MeshBuilder.CreateDisc(
      "leaf-litter",
      { radius: 1, tessellation: 7, sideOrientation: Mesh.DOUBLESIDE },
      scene,
    );
    fallen.position.set(
      Math.cos(a) * r,
      0.012 + rng() * 0.009,
      Math.sin(a) * r,
    );
    fallen.rotation.set(Math.PI / 2, 0, rng() * Math.PI * 2);
    const size = 0.025 + rng() * 0.055;
    fallen.scaling.set(size, size * 0.42, 1);
    fallen.material = litter;
    leafParts.push(fallen);
  }
  const fallenLeaves = Mesh.MergeMeshes(
    leafParts,
    true,
    true,
    undefined,
    false,
    false,
  );
  if (fallenLeaves) {
    fallenLeaves.receiveShadows = true;
    staticMeshes.push(fallenLeaves);
  }
  // Faint forest silhouettes create depth while keeping the specimen readable.
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2,
      r = 7 + rng() * 6,
      height = 6 + rng() * 6;
    const trunk = MeshBuilder.CreateCylinder(
      "distant-trunk",
      {
        height,
        diameterTop: 0.13,
        diameterBottom: 0.35 + rng() * 0.4,
        tessellation: 9,
      },
      scene,
    );
    trunk.position.set(Math.cos(a) * r, height / 2 - 0.2, Math.sin(a) * r);
    trunk.material = bark;
    trunk.rotation.z = rng() * 0.08;
    staticMeshes.push(trunk);
  }
  const log = tube(
    scene,
    "fallen-branch",
    [
      new Vector3(-2.4, 0.15, -1),
      new Vector3(-1.9, 0.2, -1.6),
      new Vector3(-1.6, 0.12, -2.3),
      new Vector3(-0.8, 0.12, -2.8),
    ],
    [0.17, 0.14, 0.11, 0.035],
    bark,
    undefined,
    12,
  );
  shadows.addShadowCaster(log);
  staticMeshes.push(log);
  for (let i = 0; i < 9; i++) {
    const x = 1.85 + rng() * 0.4,
      z = 0.3 + rng() * 0.4,
      h = 0.08 + rng() * 0.17;
    const stalk = MeshBuilder.CreateCylinder(
      "mushroom-stalk",
      { height: h, diameter: 0.027, tessellation: 7 },
      scene,
    );
    stalk.position.set(x, h / 2 + 0.04, z);
    stalk.material = food;
    const cap = ellipsoid(
      scene,
      "mushroom-cap",
      [x, h + 0.04, z],
      [h * 0.5, h * 0.17, h * 0.5],
      food,
      undefined,
      16,
    );
    staticMeshes.push(stalk, cap);
  }
  for (const m of staticMeshes) {
    m.isPickable = false;
    m.freezeWorldMatrix();
  }
  // Batch stationary undergrowth to avoid hundreds of tiny draw calls.
  for (const mat of [leaf, stem]) {
    const parts = staticMeshes.filter((m) => m.material === mat);
    const merged = Mesh.MergeMeshes(parts, true, true, undefined, false, false);
    if (merged) {
      merged.isPickable = false;
      merged.freezeWorldMatrix();
    }
  }
  const snack = ellipsoid(
    scene,
    "forage-food",
    [previewSites.food.x, 0.12, previewSites.food.z],
    [0.065, 0.07, 0.065],
    food,
  );
  snack.isPickable = false;
  shadows.addShadowCaster(snack);
  const waterMaterial = material(scene, "clearing-water", "#527b78", 0.12);
  waterMaterial.metallic = 0.3;
  const basin = ellipsoid(
    scene,
    "pool-bed",
    [previewSites.water.x, 0.015, previewSites.water.z + 0.2],
    [0.5, 0.035, 0.38],
    rock,
  );
  const water = MeshBuilder.CreateDisc(
    "drinking-pool",
    { radius: 1, tessellation: 64, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  );
  water.rotation.x = Math.PI / 2;
  water.position.set(
    previewSites.water.x,
    previewSites.water.y,
    previewSites.water.z + 0.2,
  );
  water.scaling.set(0.46, 0.34, 1);
  water.material = waterMaterial;
  const rippleMaterial = material(scene, "water-ripple", "#94b5ad", 0.3);
  rippleMaterial.alpha = 0.35;
  const ripples = [0, 1].map((i) => {
    const ring = MeshBuilder.CreateTorus(
      `drinking-ripple-${i}`,
      { diameter: 0.3, thickness: 0.004, tessellation: 32 },
      scene,
    );
    ring.position.set(
      previewSites.water.x,
      previewSites.water.y + 0.004,
      previewSites.water.z,
    );
    ring.material = rippleMaterial.clone(`ripple-material-${i}`);
    ring.isPickable = false;
    return ring;
  });
  water.isPickable = basin.isPickable = false;
  return {
    update(pose: CreaturePose) {
      snack.isVisible = !(pose.action === "forage" && pose.carrying);
      ripples.forEach((ring, i) => {
        ring.isVisible = pose.action === "drink" && pose.phase === "perform";
        const age = (pose.phaseTime * 0.8 + i * 0.5) % 1;
        ring.scaling.setAll(0.2 + age * 0.7);
        ring.material!.alpha = (1 - age) * 0.35;
      });
    },
  };
}
