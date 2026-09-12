import {
  Color3,
  Matrix,
  Mesh,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { CreaturePose, SpeciesDefinition, Traits } from "../types";
import {
  albedoTexture,
  ear,
  ellipsoid,
  material,
  random,
  sculpt,
  skinTexture,
  tube,
} from "../visual/geometry";

export const vesper: SpeciesDefinition = {
  id: "vesper-gremlin",
  version: "0.1.0",
  displayName: "Vesper",
  defaultTraits: { size: 0.5, ears: 0.5, color: 0.36 },
  createVisual(scene: Scene) {
    const root = new TransformNode("vesper-root", scene);
    const body = new TransformNode("pelvis", scene);
    body.parent = root;
    const chest = new TransformNode("thorax", scene);
    chest.parent = body;
    const head = new TransformNode("cranium", scene);
    head.parent = chest;
    head.position.set(0, 1.61, 0.17);
    const skin = material(scene, "mottled-charcoal-skin", "#67634d", 0.64);
    const bump = skinTexture(scene);
    skin.bumpTexture = bump;
    bump.level = 0.24;
    skin.albedoTexture = albedoTexture(scene);
    const membrane = material(scene, "vascular-ear-membrane", "#55443b", 0.85);
    membrane.albedoTexture = skin.albedoTexture;
    membrane.backFaceCulling = false;
    const dark = material(scene, "creases", "#25251e", 0.88);
    const horn = material(scene, "weathered-keratin", "#706d50", 0.52);
    const amber = material(scene, "iris-amber", "#a48b42", 0.3);
    const black = material(scene, "pupils", "#080b08", 0.15);
    const eyeWhite = material(scene, "ocular-surface", "#454c35", 0.2);
    const glint = material(scene, "eye-catchlight", "#d9e1c0", 0.1);
    glint.emissiveColor = new Color3(0.12, 0.14, 0.09);
    const meshes: Mesh[] = [];
    const orb = (
      name: string,
      p: number[],
      s: number[],
      mat = skin,
      parent = chest,
      seg = 32,
    ) => {
      const m = ellipsoid(scene, name, p, s, mat, parent, seg);
      meshes.push(m);
      return m;
    };
    const line = (
      name: string,
      points: number[][],
      radii: number[],
      mat = skin,
      parent = chest,
    ) => {
      const m = tube(
        scene,
        name,
        points.map((p) => Vector3.FromArray(p)),
        radii,
        mat,
        parent,
      );
      meshes.push(m);
      return m;
    };
    meshes.push(
      sculpt(
        scene,
        "continuous-torso-sculpt",
        [
          { center: [0, 0.99, -0.08], radius: [0.27, 0.43, 0.22] },
          { center: [0, 1.34, -0.12], radius: [0.37, 0.35, 0.245] },
          { center: [0, 1.48, -0.2], radius: [0.29, 0.24, 0.2] },
          { center: [0, 1.59, 0.04], radius: [0.19, 0.24, 0.18] },
          { center: [-0.3, 1.4, -0.03], radius: [0.17, 0.2, 0.16] },
          { center: [0.3, 1.4, -0.03], radius: [0.17, 0.2, 0.16] },
        ],
        [-0.55, 0.48, -0.5],
        [0.55, 1.89, 0.34],
        skin,
        chest,
        48,
        0.09,
      ),
    );
    meshes.push(
      sculpt(
        scene,
        "continuous-facial-sculpt",
        [
          { center: [0, 0.2, -0.025], radius: [0.33, 0.35, 0.265] },
          { center: [0, -0.045, 0.135], radius: [0.235, 0.12, 0.205] },
          { center: [0, 0.075, 0.285], radius: [0.073, 0.18, 0.09] },
          { center: [0, -0.01, 0.375], radius: [0.095, 0.064, 0.08] },
          { center: [-0.265, -0.015, 0.18], radius: [0.1, 0.14, 0.11] },
          { center: [0.265, -0.015, 0.18], radius: [0.1, 0.14, 0.11] },
          { center: [-0.182, 0.205, 0.22], radius: [0.18, 0.066, 0.1] },
          { center: [0.182, 0.205, 0.22], radius: [0.18, 0.066, 0.1] },
        ],
        [-0.44, -0.32, -0.34],
        [0.44, 0.61, 0.5],
        skin,
        head,
        60,
        0.055,
      ),
    );
    for (const s of [-1, 1]) {
      orb(
        "nostril",
        [s * 0.062, -0.042, 0.454],
        [0.024, 0.016, 0.011],
        dark,
        head,
        16,
      );
      line(
        "temple-ridge",
        [
          [s * 0.32, 0.03, 0.16],
          [s * 0.355, 0.22, 0.06],
          [s * 0.23, 0.43, 0.02],
        ],
        [0.04, 0.045, 0.006],
        skin,
        head,
      );
    }
    line(
      "mouth-line",
      [
        [-0.177, -0.13, 0.305],
        [-0.1, -0.155, 0.365],
        [0, -0.166, 0.38],
        [0.1, -0.155, 0.365],
        [0.177, -0.13, 0.305],
      ],
      [0.009, 0.009, 0.009, 0.009, 0.005],
      dark,
      head,
    );
    const lowerLip = line(
      "lower-lip",
      [
        [-0.15, -0.157, 0.32],
        [0, -0.186, 0.375],
        [0.15, -0.157, 0.32],
      ],
      [0.008, 0.018, 0.008],
      skin,
      head,
    );
    const jaw = new TransformNode("jaw", scene);
    jaw.parent = head;
    jaw.position.set(0, -0.13, 0.13);
    lowerLip.setParent(jaw);
    const oralCavity = orb(
      "oral-cavity",
      [0, -0.16, 0.3],
      [0.145, 0.064, 0.05],
      dark,
      head,
    );
    orb("jawline", [0, -0.08, 0.07], [0.215, 0.09, 0.15], skin, jaw);
    for (const s of [-1, 1])
      line(
        "small-tusk",
        [
          [s * 0.145, -0.183, 0.335],
          [s * 0.15, -0.125, 0.371],
          [s * 0.141, -0.085, 0.37],
        ],
        [0.022, 0.014, 0.001],
        horn,
        head,
      );

    const eyes: TransformNode[] = [],
      lids: Mesh[] = [],
      ears: TransformNode[] = [];
    for (const s of [-1, 1]) {
      const eye = new TransformNode("eye", scene);
      eye.parent = head;
      eye.position.set(s * 0.19, 0.105, 0.269);
      eye.scaling.setAll(0.77);
      orb("eye-socket", [0, 0, 0], [0.133, 0.1, 0.086], dark, eye);
      orb("eyeball", [0, 0.002, 0.031], [0.115, 0.081, 0.069], eyeWhite, eye);
      const gaze = new TransformNode("gaze", scene);
      gaze.parent = eye;
      eyes.push(gaze);
      orb("iris", [0, 0, 0.091], [0.051, 0.063, 0.016], amber, gaze);
      orb("vertical-pupil", [0, 0, 0.105], [0.014, 0.048, 0.008], black, gaze);
      orb(
        "wet-catchlight",
        [-0.016, 0.026, 0.111],
        [0.012, 0.009, 0.004],
        glint,
        gaze,
        16,
      );
      const lid = orb(
        "upper-eyelid",
        [0, 0.081, 0.05],
        [0.127, 0.021, 0.074],
        skin,
        eye,
      );
      lids.push(lid);
      line(
        "lower-orbital-rim",
        [
          [-0.115, 0, 0.021],
          [-0.07, -0.062, 0.065],
          [0, -0.075, 0.075],
          [0.07, -0.062, 0.065],
          [0.115, 0, 0.021],
        ],
        [0.009, 0.014, 0.015, 0.014, 0.009],
        skin,
        eye,
      );
      const e = new TransformNode("ear-base", scene);
      e.parent = head;
      e.position.set(s * 0.3, 0.19, -0.025);
      ears.push(e);
      meshes.push(ear(scene, s, skin, e), ear(scene, s, membrane, e, true));
      line(
        "ear-rim",
        [
          [s * 0.02, 0, 0.025],
          [s * 0.29, -0.038, 0.07],
          [s * 0.61, 0.16, -0.005],
          [s * 0.95, 0.47, -0.15],
        ],
        [0.025, 0.021, 0.014, 0.001],
        skin,
        e,
      );
      line(
        "ear-vein",
        [
          [s * 0.11, 0.08, 0.036],
          [s * 0.34, 0.14, 0.057],
          [s * 0.66, 0.29, -0.025],
        ],
        [0.014, 0.009, 0.001],
        membrane,
        e,
      );
    }
    // Fine asymmetrical nodules and folds break the silhouette without a fur shader.
    const rng = random(71);
    for (let i = 0; i < 26; i++) {
      const a = rng() * Math.PI * 2,
        y = 0.28 + rng() * 0.22;
      const x = Math.cos(a) * 0.26,
        z = Math.sin(a) * 0.13 - 0.03;
      orb(
        "dermal-nodule",
        [x, y, z],
        [0.025 + rng() * 0.02, 0.03 + rng() * 0.025, 0.025],
        skin,
        head,
        12,
      );
    }
    for (let i = 0; i < 5; i++) {
      const y = 1.1 + i * 0.084;
      line(
        "sternum-fold",
        [
          [-0.18, y, 0.15],
          [0, y - 0.024, 0.192],
          [0.18, y, 0.15],
        ],
        [0.008, 0.012, 0.008],
      );
      orb("spine", [0, 1.14 + i * 0.11, -0.395], [0.035, 0.041, 0.042], horn);
    }
    const arms: TransformNode[] = [],
      forearms: TransformNode[] = [];
    const legs: {
      root: TransformNode;
      upper: TransformNode;
      lower: TransformNode;
      foot: TransformNode;
    }[] = [];
    let heldFood: Mesh;
    const fingers: TransformNode[][] = [[], []];
    for (const s of [-1, 1]) {
      const arm = new TransformNode("shoulder", scene);
      arm.parent = chest;
      arm.position.set(s * 0.35, 1.43, -0.03);
      arms.push(arm);
      orb("deltoid", [s * 0.075, -0.09, 0.015], [0.155, 0.2, 0.155], skin, arm);
      line(
        "upper-arm",
        [
          [0, 0, 0],
          [s * 0.15, -0.23, 0.02],
          [s * 0.2, -0.43, 0.11],
        ],
        [0.11, 0.113, 0.08],
        skin,
        arm,
      );
      const fore = new TransformNode("elbow", scene);
      fore.parent = arm;
      fore.position.set(s * 0.2, -0.43, 0.11);
      forearms.push(fore);
      orb("elbow-joint", [0, 0, 0], [0.083, 0.095, 0.086], skin, fore);
      line(
        "forearm",
        [
          [0, 0, 0],
          [s * 0.025, -0.19, 0.085],
          [s * 0.035, -0.39, 0.12],
        ],
        [0.085, 0.087, 0.045],
        skin,
        fore,
      );
      orb("palm", [s * 0.035, -0.44, 0.135], [0.095, 0.11, 0.051], skin, fore);
      if (s < 0) {
        const snack = material(scene, "held-mushroom", "#827455", 0.85);
        heldFood = orb(
          "held-food",
          [s * 0.035, -0.49, 0.2],
          [0.065, 0.07, 0.065],
          snack,
          fore,
        );
        heldFood.isVisible = false;
      }
      for (let j = 0; j < 4; j++) {
        const finger = new TransformNode("finger-knuckle", scene);
        finger.parent = fore;
        finger.position.set(s * (0.035 + (j - 1.5) * 0.041), -0.48, 0.145);
        fingers[s < 0 ? 0 : 1].push(finger);
        const x = s * (0.035 + (j - 1.5) * 0.041),
          length = 0.12 + Math.sin((j / 3) * Math.PI) * 0.045;
        const digit = line(
          "finger",
          [
            [x, -0.48, 0.145],
            [x + s * 0.01, -0.48 - length * 0.7, 0.16],
            [x, -0.48 - length, 0.195],
          ],
          [0.018, 0.014, 0.008],
          skin,
          fore,
        );
        digit.setParent(finger);
        const nail = line(
          "fingernail",
          [
            [x, -0.48 - length, 0.195],
            [x, -0.51 - length, 0.222],
          ],
          [0.011, 0.001],
          horn,
          fore,
        );
        nail.setParent(finger);
      }
      line(
        "thumb",
        [
          [s * -0.033, -0.4, 0.16],
          [s * -0.095, -0.45, 0.205],
          [s * -0.08, -0.5, 0.22],
        ],
        [0.03, 0.022, 0.005],
        skin,
        fore,
      );
      const leg = new TransformNode("hip", scene);
      leg.parent = body;
      leg.position.set(s * 0.235, 0.83, -0.065);
      const upper = new TransformNode("femur", scene);
      upper.parent = leg;
      const lower = new TransformNode("tibia", scene);
      lower.parent = leg;
      const foot = new TransformNode("ankle", scene);
      foot.parent = leg;
      legs.push({ root: leg, upper, lower, foot });
      orb("thigh", [0, -0.15, 0], [0.14, 0.24, 0.14], skin, upper);
      orb("knee", [0, 0, 0], [0.094, 0.1, 0.095], skin, lower);
      line(
        "shin",
        [
          [0, 0, 0],
          [0, -0.18, 0],
          [0, -0.39, 0],
        ],
        [0.081, 0.072, 0.047],
        skin,
        lower,
      );
      orb("heel", [0, -0.018, 0], [0.067, 0.067, 0.075], skin, foot);
      orb("foot", [0, -0.044, 0.115], [0.11, 0.06, 0.18], skin, foot);
      for (let j = 0; j < 3; j++) {
        const x = (j - 1) * 0.07;
        line(
          "toe",
          [
            [x, -0.04, 0.155],
            [x, -0.06, 0.285],
            [x, -0.046, 0.325],
          ],
          [0.032, 0.025, 0.008],
          skin,
          foot,
        );
        line(
          "toe-claw",
          [
            [x, -0.046, 0.315],
            [x, -0.048, 0.385],
          ],
          [0.018, 0.001],
          horn,
          foot,
        );
      }
    }
    const tail = new TransformNode("tail-base", scene);
    tail.parent = body;
    tail.position.set(0, 0.84, -0.24);
    line(
      "tail",
      [
        [0, 0, 0],
        [0.04, -0.12, -0.27],
        [0.18, -0.38, -0.51],
        [0.41, -0.56, -0.62],
        [0.65, -0.59, -0.55],
        [0.73, -0.5, -0.43],
      ],
      [0.09, 0.079, 0.059, 0.036, 0.018, 0.002],
      skin,
      tail,
    );
    let traits: Traits = { ...vesper.defaultTraits },
      activity = 0,
      sleep = 0,
      eating = 0;
    let previousX = 0,
      previousZ = 0,
      stride = 0,
      previousTime = 0;
    const setTraits = (next: Traits) => {
      traits = {
        size: Math.min(1, Math.max(0, next.size)),
        ears: Math.min(1, Math.max(0, next.ears)),
        color: Math.min(1, Math.max(0, next.color)),
      };
      root.scaling.setAll(0.8 + traits.size * 0.4);
      ears.forEach((e) =>
        e.scaling.set(
          0.7 + traits.ears * 0.6,
          0.55 + traits.ears * 0.45,
          0.7 + traits.ears * 0.6,
        ),
      );
      skin.albedoColor = Color3.Lerp(
        Color3.FromHexString("#56635b"),
        Color3.FromHexString("#907958"),
        traits.color,
      );
      membrane.albedoColor = Color3.Lerp(
        Color3.FromHexString("#403a36"),
        Color3.FromHexString("#745447"),
        traits.color,
      );
    };
    setTraits(traits);
    return {
      root,
      meshes,
      setTraits,
      update(p: CreaturePose) {
        if (p.time < previousTime) {
          activity = sleep = eating = stride = 0;
          previousX = p.x;
          previousZ = p.z;
        }
        previousTime = p.time;
        const blend = 1 - Math.exp(-p.delta * 5);
        activity += ((p.moving ? 1 : 0) - activity) * blend;
        sleep +=
          ((p.action === "rest"
            ? p.phase === "exit"
              ? Math.max(0, 1 - p.phaseTime / 1.4)
              : 0.65
            : p.action === "sleep"
              ? p.interaction
              : 0) -
            sleep) *
          blend;
        const asleep = p.action === "sleep" ? p.interaction : 0;
        const grooming = p.action === "groom" ? p.interaction : 0;
        const startled = p.action === "startle" ? p.interaction : 0;
        const stretch =
          p.action === "sleep" && p.phase === "exit"
            ? Math.sin(Math.min(1, p.phaseTime / 3) * Math.PI) * 0.22
            : 0;
        const foraging = p.action === "forage";
        const drinking = p.action === "drink";
        const bend = foraging || drinking ? p.interaction : 0;
        const feeding = p.action === "eat" || (foraging && p.carrying);
        const exitWeight =
          p.phase === "exit" ? Math.max(0, 1 - p.phaseTime / 1.4) : 1;
        eating += ((feeding ? (1 - bend) * exitWeight : 0) - eating) * blend;
        const scale = root.scaling.x;
        const distance = Math.hypot(p.x - previousX, p.z - previousZ);
        stride += ((distance / scale) * Math.PI * 2) / 0.64;
        previousX = p.x;
        previousZ = p.z;
        root.position.set(p.x, 0, p.z);
        root.rotation.y = p.heading;
        const breath = Math.sin(p.time * (1.65 - sleep * 0.55));
        const cycle =
          (foraging ? Math.max(0, p.phaseTime - 1.6) : p.actionTime) % 4.8;
        const smooth = (v: number) => {
          const t = Math.min(1, Math.max(0, v));
          return t * t * (3 - 2 * t);
        };
        const liftFood =
          smooth(cycle / 1.1) * (1 - smooth((cycle - 2.0) / 0.9));
        const chew =
          cycle > 1.35 && cycle < 4.25
            ? Math.max(0, Math.sin((cycle - 1.35) * 11))
            : 0;
        const bob = Math.cos(stride * 2) * 0.014 * activity;
        body.position.y =
          -0.23 * sleep -
          0.18 * asleep -
          bend * 0.5 +
          breath * 0.008 * (1 - bend) +
          bob -
          startled * 0.06;
        body.rotation.z = Math.sin(stride) * 0.025 * activity;
        chest.rotation.x =
          0.035 * eating +
          0.16 * sleep +
          0.32 * asleep +
          bend * (drinking ? 1.3 : 0.55) -
          0.07 * startled;
        // Bend around the waist rather than rotating the torso about the floor.
        chest.position.set(
          0,
          0.95 * (1 - Math.cos(chest.rotation.x)),
          -0.95 * Math.sin(chest.rotation.x),
        );
        chest.scaling.y = 1 + breath * 0.007 * (1 - bend);
        chest.scaling.z = 1 + breath * (0.021 + sleep * 0.012) * (1 - bend);
        const attention = Math.sin(p.time * 0.39) > 0.45 ? 0.24 : -0.12;
        head.rotation.y +=
          (attention * (1 - sleep) * (1 - eating) * (1 - bend) -
            head.rotation.y) *
          (1 - Math.exp(-p.delta * 2.8));
        head.rotation.x =
          0.29 * sleep +
          0.025 * eating +
          Math.sin(p.time * 1.1) * 0.012 +
          chew * eating * 0.018;
        head.rotation.x *= 1 - bend;
        head.rotation.x += foraging ? bend * 0.18 : 0;
        head.rotation.x += 0.22 * asleep - 0.12 * startled;
        head.rotation.x -= stretch;
        head.rotation.z =
          Math.sin(p.time * 0.37) * 0.025 * (1 - sleep) * (1 - bend);
        const sip =
          drinking && p.phase === "perform"
            ? Math.max(0, Math.sin(p.phaseTime * 8))
            : 0;
        jaw.rotation.x =
          -eating *
          (0.035 +
            chew * 0.24 +
            liftFood * (1 - smooth((cycle - 1.3) / 0.3)) * 0.2);
        jaw.rotation.x -= sip * 0.08;
        jaw.rotation.y = eating * chew * 0.035;
        oralCavity.isVisible = eating > 0.05 || sip > 0;
        if (drinking && p.target && bend > 0) {
          // Mouth height at full lean, interpolated into the crouch without dipping
          // below it midway through entry. The legs compensate for pelvis height.
          const mouthAtLean =
            0.95 +
            (1.61 - 0.166 - 0.95) * Math.cos(1.3) -
            (0.17 + 0.38) * Math.sin(1.3);
          body.position.y =
            bend * ((p.target.y + 0.008 + sip * 0.006) / scale - mouthAtLean) +
            breath * 0.008 * (1 - bend);
        }
        body.computeWorldMatrix(true);
        chest.computeWorldMatrix(true);
        const blinkPhase = p.time % 4.9;
        const blink =
          blinkPhase < 0.18 ? Math.sin((blinkPhase / 0.18) * Math.PI) : 0;
        lids.forEach((lid) => {
          const close = Math.max(blink, asleep);
          lid.scaling.y = 0.021 + close * 0.067;
          lid.position.y = 0.081 - close * 0.054;
        });
        eyes.forEach(
          (gaze) =>
            (gaze.position.x = Math.sin(p.time * 0.7) * 0.012 * (1 - sleep)),
        );
        ears.forEach(
          (e, i) =>
            (e.rotation.z =
              (i ? 1 : -1) *
              (Math.sin(p.time * 0.7) * 0.025 - sleep * 0.1 + startled * 0.18)),
        );
        arms.forEach((a, i) => {
          const swing = Math.sin(stride + i * Math.PI);
          const bite = liftFood;
          a.rotationQuaternion = null;
          forearms[i].rotationQuaternion = null;
          a.rotation.x =
            -stretch * 2 +
            -swing * 0.17 * activity -
            eating * (i ? 0.5 : 0.9 + bite * 0.2) +
            sleep * 0.13;
          a.rotation.z = (i ? -1 : 1) * (0.04 + sleep * 0.1 + eating * 0.52);
          forearms[i].rotation.x =
            -eating * (i ? 1.3 : 1.55 + bite * 0.2) +
            Math.sin(p.time * 0.8 + i) * 0.025;
          // Solve the hand target in chest space, keeping elbow and wrist connected.
          const reach = foraging || drinking ? bend : 0;
          if (
            eating > 0.001 ||
            reach > 0.001 ||
            grooming > 0.001 ||
            asleep > 0.001
          ) {
            const side = i ? 1 : -1;
            const shoulder = a.position;
            let hand = Vector3.Lerp(
              new Vector3(side * 0.3, 1.04, 0.43),
              new Vector3(i ? 0.19 : -0.035, i ? 1.22 : 1.48, i ? 0.46 : 0.57),
              i ? liftFood * 0.25 : liftFood,
            );
            if (reach > 0 && p.target) {
              const pickup = Vector3.TransformCoordinates(
                drinking
                  ? new Vector3(
                      p.x + side * 0.42 * scale,
                      0.14 * scale,
                      p.z + 0.28 * scale,
                    )
                  : new Vector3(
                      p.target.x + (i ? 0.2 * scale : 0),
                      p.target.y + (i ? 0.1 : 0),
                      p.target.z,
                    ),
                Matrix.Invert(chest.getWorldMatrix()),
              );
              hand = Vector3.Lerp(hand, pickup, reach);
            }
            if (grooming > 0) {
              // Scratch the temple, pause, then brush the chest with the other hand.
              const stroke = Math.sin(p.phaseTime * 15) * 0.025;
              const face = p.phaseTime < 3.2;
              const active = face ? i === 0 : i === 1;
              const target = face
                ? new Vector3(-0.31, 1.78 + stroke, 0.29)
                : new Vector3(
                    0.16,
                    1.24 + Math.sin(p.phaseTime * 5) * 0.08,
                    0.24,
                  );
              const pause =
                p.phase === "perform" && p.phaseTime > 2.6 && p.phaseTime < 3.5
                  ? 0.25
                  : 1;
              if (active) hand = Vector3.Lerp(hand, target, grooming * pause);
            }
            if (asleep > 0)
              hand = Vector3.Lerp(
                hand,
                new Vector3(side * 0.22, 0.86, 0.28),
                asleep,
              );
            const upperRest = forearms[i].position.clone();
            const handRest = new Vector3(side * 0.035, -0.49, 0.2);
            const direction = hand.subtract(shoulder);
            const length = direction.length();
            direction.normalize();
            const l1 = upperRest.length(),
              l2 = handRest.length();
            const d = Math.min(length, l1 + l2 - 0.001);
            const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
            const bend = new Vector3(side * 0.8, -1, 0);
            bend
              .subtractInPlace(direction.scale(Vector3.Dot(bend, direction)))
              .normalize();
            const elbow = direction
              .scale(along)
              .add(bend.scale(Math.sqrt(Math.max(0, l1 * l1 - along * along))));
            const upperQ = Quaternion.FromUnitVectorsToRef(
              upperRest.normalizeToNew(),
              elbow.normalizeToNew(),
              Quaternion.Identity(),
            );
            const localHand = hand.subtract(shoulder).subtract(elbow);
            localHand.rotateByQuaternionToRef(upperQ.conjugate(), localHand);
            const lowerQ = Quaternion.FromUnitVectorsToRef(
              handRest.normalizeToNew(),
              localHand.normalize(),
              Quaternion.Identity(),
            );
            a.rotationQuaternion = Quaternion.Slerp(
              Quaternion.FromEulerVector(a.rotation),
              upperQ,
              Math.max(
                eating,
                reach,
                grooming,
                asleep,
                p.carrying ? exitWeight : 0,
              ),
            );
            forearms[i].rotationQuaternion = Quaternion.Slerp(
              Quaternion.FromEulerVector(forearms[i].rotation),
              lowerQ,
              Math.max(
                eating,
                reach,
                grooming,
                asleep,
                p.carrying ? exitWeight : 0,
              ),
            );
          }
          fingers[i].forEach(
            (finger, j) =>
              (finger.rotation.x =
                -Math.max(eating, p.carrying ? bend : 0) * (0.7 + j * 0.09)),
          );
          // Linear stance motion cancels root travel; only the swing foot lifts.
          const phase = (((stride / (Math.PI * 2) + i * 0.5) % 1) + 1) % 1;
          const u = Math.max(0, (phase - 0.5) * 2);
          const offset =
            phase < 0.5
              ? 0.16 - 0.64 * phase
              : -0.16 + 0.32 * u * u * (3 - 2 * u);
          const lift = phase < 0.5 ? 0 : Math.sin(u * Math.PI) * 0.09;
          const ankleY = -0.71 + lift * activity - body.position.y;
          const ankleZ = 0.085 + offset * activity;
          const d = Math.hypot(ankleY, ankleZ),
            along = (0.4 ** 2 - 0.39 ** 2 + d * d) / (2 * d);
          const height = Math.sqrt(Math.max(0, 0.4 ** 2 - along * along));
          const kneeY = (ankleY / d) * along + (ankleZ / d) * height;
          const kneeZ = (ankleZ / d) * along - (ankleY / d) * height;
          legs[i].upper.rotation.x = Math.atan2(-kneeZ, -kneeY);
          legs[i].lower.position.set(0, kneeY, kneeZ);
          legs[i].lower.rotation.x = Math.atan2(
            -(ankleZ - kneeZ),
            -(ankleY - kneeY),
          );
          legs[i].foot.position.set(0, ankleY, ankleZ);
        });
        heldFood.isVisible =
          (p.action === "eat" && eating > 0.1) || (foraging && p.carrying);
        heldFood.scaling.set(0.065, cycle > 1.8 ? 0.043 : 0.07, 0.065);
        tail.rotation.y = Math.sin(p.time * 0.9) * 0.1 * (1 - sleep);
        tail.position.y = 0.84 - Math.min(0, body.position.y);
      },
      dispose() {
        root.dispose(false, true);
      },
    };
  },
};
