import type { Scene, TransformNode, AbstractMesh } from "@babylonjs/core";

export type Action = "observe" | "walk" | "rest" | "eat" | "forage" | "drink";
export type ActionPhase = "approach" | "search" | "enter" | "perform" | "exit";
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
  phase: ActionPhase;
  phaseTime: number;
  interaction: number;
  moving: boolean;
  carrying: boolean;
  target?: { x: number; y: number; z: number };
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
