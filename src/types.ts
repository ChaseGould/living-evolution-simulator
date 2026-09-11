import type { Scene, TransformNode, AbstractMesh } from "@babylonjs/core";

export type Action = "observe" | "walk" | "rest" | "eat";
/** Trait keys belong to a species; the visual contract assumes no particular anatomy. */
export type Traits = Record<string, number>;
export interface CreaturePose {
  time: number;
  delta: number;
  action: Action;
  actionTime: number;
  x: number;
  z: number;
  heading: number;
}
export interface CreatureVisual {
  root: TransformNode;
  meshes: AbstractMesh[];
  setTraits(traits: Traits): void;
  update(pose: CreaturePose): void;
  dispose(): void;
}
export interface SpeciesDefinition {
  id: string;
  version: string;
  displayName: string;
  defaultTraits: Traits;
  createVisual(scene: Scene): CreatureVisual;
}
