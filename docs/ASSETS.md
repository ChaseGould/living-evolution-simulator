# Asset provenance and art direction

The user chose a darker, more realistic creature on 2026-09-10. The prototype uses
an original woodland gremlin called Vesper: charcoal/umber mottled skin, elongated ears, angular facial features, restrained amber eyes, claws, and a hunched stance.

## Original procedural assets

- `src/species/vesper.ts`: creature anatomy, face details, articulated node rig,
  appearance mapping, and procedural poses. No downloaded creature or reference
  model was used. Head and torso are continuous implicit surfaces; limbs are
  attached articulated forms. This is not a skinned-mesh skeleton or GLB export.
- `src/visual/geometry.ts`: custom implicit-surface polygonization, shaped ears,
  mottled albedo maps and skin microstructure textures generated locally.
- `src/visual/habitat.ts`: original terrain arrangement, rocks, ferns, trunks,
  mushrooms, fallen branch, collectible food prop, drinking pool, and ripple
  rings. These new interaction props are original procedural geometry.
- `src/main.ts`: original inline UI icons. No third-party icon set.

No asset purchases, generative image service, externally downloaded artwork, or
unverified commercial models are part of this prototype. The character remains
visibly procedural and needs user review before it can establish final quality.

## Third-party packages

- Babylon.js 9.26.0: Apache-2.0; installed from `@babylonjs/core` on npm.
- DM Sans and Manrope fonts: OFL-1.1; installed from the corresponding Fontsource
  npm packages. Latin font files are bundled locally. Licenses are copied into public/licenses for distribution and also ship in each
  package's LICENSE file in node_modules and should accompany redistribution.
- Tooling versions and exact dependency graph are recorded in package-lock.json.

## Production asset follow-up

If this visual proof falls short, retain the scene and controls but replace the
species visual factory with an authored creature model, skin weights, designed
morph targets, and animation clips. Final realistic skin, integrated joints,
facial anatomy, and contact animation should be evaluated at that checkpoint.
