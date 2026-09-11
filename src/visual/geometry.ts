import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
  VertexData,
} from "@babylonjs/core";

export function random(seed = 2718) {
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
}

export function material(
  scene: Scene,
  name: string,
  color: string,
  roughness = 0.8,
) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = Color3.FromHexString(color);
  m.roughness = roughness;
  m.metallic = 0;
  return m;
}

export function skinTexture(scene: Scene) {
  const texture = new DynamicTexture(
    "original-leather-microstructure",
    512,
    scene,
    true,
  );
  const ctx = texture.getContext() as CanvasRenderingContext2D;
  const rng = random(3291);
  ctx.fillStyle = "#9d9d9d";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 39000; i++) {
    const v = Math.floor(115 + rng() * 80);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.1 + rng() * 0.45})`;
    ctx.beginPath();
    ctx.ellipse(
      rng() * 512,
      rng() * 512,
      0.3 + rng() * 2.2,
      0.3 + rng() * 1.3,
      rng() * 6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  texture.update();
  texture.uScale = 2;
  texture.vScale = 2;
  return texture;
}

export function albedoTexture(scene: Scene) {
  const texture = new DynamicTexture(
    "original-mottled-pigment",
    512,
    scene,
    true,
  );
  const ctx = texture.getContext() as CanvasRenderingContext2D;
  const rng = random(224);
  ctx.fillStyle = "#9e9987";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) {
    const x = rng() * 512,
      y = rng() * 512,
      r = 2 + rng() * 19;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, i % 2 ? "#393d3038" : "#c1af8b28");
    gradient.addColorStop(1, "#77776000");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 14000; i++) {
    ctx.fillStyle = rng() > 0.5 ? "#332f281c" : "#c1bda51b";
    ctx.fillRect(rng() * 512, rng() * 512, 1, 1);
  }
  texture.update();
  return texture;
}

type Blob = { center: number[]; radius: number[] };
/** Smooth implicit sculpt, polygonized with marching tetrahedra. Original source asset. */
export function sculpt(
  scene: Scene,
  name: string,
  blobs: Blob[],
  min: number[],
  max: number[],
  mat: PBRMaterial,
  parent: TransformNode,
  resolution = 42,
  smooth = 0.075,
) {
  function field(x: number, y: number, z: number) {
    let d = 100;
    for (const b of blobs) {
      const q = Math.hypot(
        (x - b.center[0]) / b.radius[0],
        (y - b.center[1]) / b.radius[1],
        (z - b.center[2]) / b.radius[2],
      );
      const next = (q - 1) * Math.min(...b.radius);
      const h = Math.max(smooth - Math.abs(d - next), 0) / smooth;
      d = Math.min(d, next) - h * h * smooth * 0.25;
    }
    return (
      d +
      Math.sin(x * 47 + Math.sin(y * 21)) *
        Math.sin(y * 39 + z * 17) *
        Math.sin(z * 43) *
        0.0013
    );
  }
  function normal(p: number[]) {
    const e = 0.001;
    return new Vector3(
      field(p[0] + e, p[1], p[2]) - field(p[0] - e, p[1], p[2]),
      field(p[0], p[1] + e, p[2]) - field(p[0], p[1] - e, p[2]),
      field(p[0], p[1], p[2] + e) - field(p[0], p[1], p[2] - e),
    ).normalize();
  }
  const n = resolution,
    positions: number[] = [],
    normals: number[] = [],
    indices: number[] = [],
    uvs: number[] = [];
  const stride = n + 1,
    samples = new Float32Array(stride ** 3);
  const point = (x: number, y: number, z: number) => [
    min[0] + ((max[0] - min[0]) * x) / n,
    min[1] + ((max[1] - min[1]) * y) / n,
    min[2] + ((max[2] - min[2]) * z) / n,
  ];
  const index = (x: number, y: number, z: number) =>
    (x * stride + y) * stride + z;
  for (let x = 0; x <= n; x++)
    for (let y = 0; y <= n; y++)
      for (let z = 0; z <= n; z++) {
        const p = point(x, y, z);
        samples[index(x, y, z)] = field(p[0], p[1], p[2]);
      }
  const corners = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ];
  const tets = [
    [0, 5, 1, 6],
    [0, 1, 2, 6],
    [0, 2, 3, 6],
    [0, 3, 7, 6],
    [0, 7, 4, 6],
    [0, 4, 5, 6],
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) {
        const values = corners.map(
          (c) => samples[index(x + c[0], y + c[1], z + c[2])],
        );
        if (values.every((v) => v > 0) || values.every((v) => v < 0)) continue;
        const points = corners.map((c) => point(x + c[0], y + c[1], z + c[2]));
        for (const tet of tets) {
          const poly: number[][] = [];
          for (const [a, b] of edges) {
            const ia = tet[a],
              ib = tet[b];
            if (values[ia] < 0 === values[ib] < 0) continue;
            const t = values[ia] / (values[ia] - values[ib]);
            poly.push(points[ia].map((v, k) => v + t * (points[ib][k] - v)));
          }
          if (poly.length < 3) continue;
          const center = [0, 1, 2].map(
            (k) => poly.reduce((sum, p) => sum + p[k], 0) / poly.length,
          );
          const norm = normal(center),
            tangent = Vector3.Cross(
              norm,
              Math.abs(norm.y) < 0.9 ? Vector3.Up() : Vector3.Right(),
            ).normalize(),
            bitangent = Vector3.Cross(norm, tangent);
          poly.sort((a, b) => {
            const angle = (p: number[]) => {
              const v = Vector3.FromArray(p).subtract(
                Vector3.FromArray(center),
              );
              return Math.atan2(
                Vector3.Dot(v, bitangent),
                Vector3.Dot(v, tangent),
              );
            };
            return angle(a) - angle(b);
          });
          for (let k = 1; k < poly.length - 1; k++) {
            // Babylon uses clockwise front faces; reverse the outward CCW polygon.
            for (const p of [poly[0], poly[k + 1], poly[k]]) {
              indices.push(positions.length / 3);
              positions.push(...p);
              const v = normal(p);
              normals.push(v.x, v.y, v.z);
              uvs.push(p[0] * 1.4 + 0.5, p[1] * 1.1);
            }
          }
        }
      }
  const data = new VertexData();
  Object.assign(data, { positions, indices, normals, uvs });
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  mesh.material = mat;
  mesh.parent = parent;
  return mesh;
}

export function ellipsoid(
  scene: Scene,
  name: string,
  position: number[],
  scale: number[],
  mat: PBRMaterial,
  parent?: TransformNode,
  segments = 32,
) {
  const m = MeshBuilder.CreateSphere(name, { diameter: 2, segments }, scene);
  m.position.set(position[0], position[1], position[2]);
  m.scaling.set(scale[0], scale[1], scale[2]);
  m.material = mat;
  if (parent) m.parent = parent;
  return m;
}

export function tube(
  scene: Scene,
  name: string,
  path: Vector3[],
  radii: number[],
  mat: PBRMaterial,
  parent?: TransformNode,
  tessellation = 12,
) {
  const mesh = MeshBuilder.CreateTube(
    name,
    { path, radiusFunction: (i) => radii[i], tessellation, cap: Mesh.CAP_ALL },
    scene,
  );
  mesh.material = mat;
  if (parent) mesh.parent = parent;
  return mesh;
}

/** Closed organic ear, shaped in local space so its root never leaves the skull. */
export function ear(
  scene: Scene,
  side: number,
  mat: PBRMaterial,
  parent: TransformNode,
  inner = false,
) {
  const positions: number[] = [],
    indices: number[] = [],
    uvs: number[] = [];
  const rows = 32,
    ring = 24;
  for (let i = 0; i <= rows; i++) {
    const t = inner ? 0.1 + (i / rows) * 0.8 : i / rows;
    const breadth = Math.sin(Math.PI * t) ** 0.75 * 0.235 + 0.004;
    for (let j = 0; j <= ring; j++) {
      const a = (j / ring) * Math.PI * 2;
      const width = inner ? ((j / ring) * 2 - 1) * 0.78 : Math.sin(a);
      const depth = inner ? Math.sqrt(1 - width * width) : Math.cos(a);
      positions.push(
        side * (t * 0.95 + width * breadth * 0.25),
        t * 0.47 + width * breadth,
        depth * breadth * 0.26 - t * t * 0.15 + (inner ? 0.004 : 0),
      );
      uvs.push(t, j / ring);
      if (i < rows && j < ring) {
        const p = i * (ring + 1) + j;
        if (side > 0)
          indices.push(
            p,
            p + 1,
            p + ring + 1,
            p + 1,
            p + ring + 2,
            p + ring + 1,
          );
        else
          indices.push(
            p,
            p + ring + 1,
            p + 1,
            p + 1,
            p + ring + 1,
            p + ring + 2,
          );
      }
    }
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const data = new VertexData();
  Object.assign(data, { positions, indices, normals, uvs });
  const m = new Mesh(inner ? "ear-membrane" : "ear-cartilage", scene);
  data.applyToMesh(m);
  m.material = mat;
  m.parent = parent;
  return m;
}
