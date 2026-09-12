import type { Action, ActionPhase, CreaturePose } from "./types";

// Presentation locations in the open clearing, shared with the habitat adapter.
export const previewSites = {
  food: { x: -0.85, z: 0.65 },
  water: { x: 0.8, z: 0.8, y: 0.065 },
  stimulus: { x: 1.2, y: 0.3, z: 1.2 },
};
const stepSeconds = 1 / 120;
const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

/** Presentation only. Fixed steps keep action scheduling independent of frames. */
export class PreviewDirector {
  time = 0;
  actionTime = 0;
  phaseTime = 0;
  phase: ActionPhase = "perform";
  action: Action = "observe";
  automatic = true;
  paused = false;
  x = 0;
  z = 0;
  heading = 0;
  interaction = 0;
  carrying = false;
  moving = false;
  private targetX = 0;
  private targetZ = 0;
  private sequence = 0;
  private remainder = 0;
  private pending?: { action: Action; automatic: boolean };
  private exitFrom = 0;
  private readonly sequenceActions: Action[] = [
    "forage",
    "observe",
    "drink",
    "rest",
    "walk",
    "groom",
    "sleep",
    "startle",
  ];

  setAction(action: Action, automatic = false) {
    this.automatic = automatic;
    // Finish lowering/standing before replacing an interaction. Last request wins.
    if (
      ["forage", "drink", "groom", "sleep", "startle", "eat", "rest"].includes(
        this.action,
      ) &&
      this.phase !== "approach"
    ) {
      this.pending = { action, automatic };
      if (this.phase !== "exit") this.beginExit();
      return;
    }
    this.begin(action, automatic);
  }
  private begin(action: Action, automatic: boolean) {
    this.action = action;
    this.automatic = automatic;
    this.actionTime = this.phaseTime = this.interaction = 0;
    this.carrying = this.moving = false;
    this.pending = undefined;
    this.phase =
      action === "walk" || action === "forage" || action === "drink"
        ? "approach"
        : ["groom", "sleep", "startle"].includes(action)
          ? "enter"
          : "perform";
    if (action === "walk") {
      this.targetX = this.sequence % 2 ? 1.4 : -0.9;
      this.targetZ = this.sequence % 2 ? 0.35 : -0.55;
      if (Math.hypot(this.targetX - this.x, this.targetZ - this.z) < 0.15) {
        this.targetX = -this.targetX;
        this.targetZ = -this.targetZ;
      }
    }
  }
  private changePhase(phase: ActionPhase) {
    this.phase = phase;
    this.phaseTime = 0;
  }
  private beginExit() {
    this.exitFrom = this.interaction;
    this.changePhase("exit");
  }
  reset() {
    this.time =
      this.x =
      this.z =
      this.heading =
      this.sequence =
      this.remainder =
        0;
    this.paused = false;
    this.begin("observe", true);
  }
  private advance(delta: number, size: number) {
    this.time += delta;
    this.actionTime += delta;
    this.phaseTime += delta;
    this.moving = false;
    const scale = 0.8 + Math.min(1, Math.max(0, size)) * 0.4;
    const interactionAction =
      this.action === "forage" || this.action === "drink";
    if (this.phase === "approach") {
      if (interactionAction) {
        const site =
          this.action === "forage" ? previewSites.food : previewSites.water;
        this.targetX = site.x;
        this.targetZ = site.z - 0.64 * scale;
      }
      const dx = this.targetX - this.x,
        dz = this.targetZ - this.z;
      const distance = Math.hypot(dx, dz);
      const desired =
        distance > 0.008
          ? Math.atan2(dx, dz)
          : interactionAction
            ? 0
            : this.heading;
      const angle = Math.atan2(
        Math.sin(desired - this.heading),
        Math.cos(desired - this.heading),
      );
      this.heading += Math.max(-delta * 2.5, Math.min(delta * 2.5, angle));
      if (distance > 0.008 && Math.abs(angle) < 0.15) {
        const step = Math.min(distance, delta * 0.25 * scale);
        this.x += (dx / distance) * step;
        this.z += (dz / distance) * step;
        this.moving = true;
      }
      if (distance <= 0.008 && Math.abs(angle) < 0.015) {
        this.x = this.targetX;
        this.z = this.targetZ;
        if (interactionAction)
          this.changePhase(this.action === "forage" ? "search" : "enter");
        else this.begin("observe", this.automatic);
      } else if (this.phaseTime > 30) {
        this.begin("observe", this.automatic);
      }
    } else if (interactionAction) {
      if (this.phase === "search") {
        this.interaction = smooth(this.phaseTime / 0.8) * 0.16;
        if (this.phaseTime >= 2.4) this.changePhase("enter");
      } else if (this.phase === "enter") {
        this.interaction =
          (this.action === "forage" ? 0.16 : 0) +
          (this.action === "forage" ? 0.84 : 1) * smooth(this.phaseTime / 1.6);
        if (this.phaseTime >= 1.6) {
          this.carrying = this.action === "forage";
          this.changePhase("perform");
        }
      } else if (this.phase === "perform") {
        this.interaction =
          this.action === "forage" ? 1 - smooth(this.phaseTime / 1.6) : 1;
        if (this.phaseTime >= (this.action === "forage" ? 7 : 4.8))
          this.beginExit();
      } else if (this.phase === "exit") {
        this.interaction = this.exitFrom * (1 - smooth(this.phaseTime / 1.4));
        if (this.phaseTime >= 1.4) {
          const next = this.pending;
          this.begin(
            next?.action ?? "observe",
            next?.automatic ?? this.automatic,
          );
        }
      }
    } else if (
      ["groom", "sleep", "startle"].includes(this.action) ||
      this.phase === "exit"
    ) {
      const entry =
        this.action === "sleep" ? 3 : this.action === "startle" ? 0.45 : 1;
      const duration =
        this.action === "sleep" ? 10 : this.action === "groom" ? 7 : 2.5;
      if (this.phase === "enter") {
        this.interaction = smooth(this.phaseTime / entry);
        if (this.action === "startle") {
          const desired = Math.atan2(
            previewSites.stimulus.x - this.x,
            previewSites.stimulus.z - this.z,
          );
          const angle = Math.atan2(
            Math.sin(desired - this.heading),
            Math.cos(desired - this.heading),
          );
          this.heading += Math.max(-delta * 4, Math.min(delta * 4, angle));
        }
        if (this.phaseTime >= entry) this.changePhase("perform");
      } else if (this.phase === "perform") {
        this.interaction = 1;
        if (this.action === "startle" && this.phaseTime < 0.65) {
          this.x = Math.max(
            -1.5,
            Math.min(1.5, this.x - Math.sin(this.heading) * delta * 0.3),
          );
          this.z = Math.max(
            -1.5,
            Math.min(1.5, this.z - Math.cos(this.heading) * delta * 0.3),
          );
          this.moving = true;
        }
        if (this.phaseTime >= duration) this.beginExit();
      } else if (this.phase === "exit") {
        const duration = this.action === "sleep" ? 3 : 1.4;
        this.interaction =
          this.exitFrom * (1 - smooth(this.phaseTime / duration));
        if (this.phaseTime >= duration) {
          const next = this.pending;
          this.begin(
            next?.action ?? "observe",
            next?.automatic ?? this.automatic,
          );
        }
      }
    } else if (
      this.automatic &&
      this.actionTime >= (this.action === "rest" ? 9 : 5)
    ) {
      this.begin(
        this.sequenceActions[this.sequence++ % this.sequenceActions.length],
        true,
      );
    }
  }
  tick(delta: number, size: number): CreaturePose {
    let elapsed = 0;
    if (!this.paused && Number.isFinite(delta) && delta > 0) {
      this.remainder += delta;
      while (this.remainder + 1e-10 >= stepSeconds) {
        this.advance(stepSeconds, size);
        this.remainder -= stepSeconds;
        elapsed += stepSeconds;
      }
    }
    return {
      time: this.time,
      delta: elapsed,
      action: this.action,
      actionTime: this.actionTime,
      x: this.x,
      z: this.z,
      heading: this.heading,
      phase: this.phase,
      phaseTime: this.phaseTime,
      interaction: this.interaction,
      moving: this.moving,
      carrying: this.carrying,
      target:
        this.action === "forage"
          ? { ...previewSites.food, y: 0.12 }
          : this.action === "drink"
            ? previewSites.water
            : this.action === "startle"
              ? previewSites.stimulus
              : undefined,
    };
  }
}
