import type { Action, CreaturePose } from "./types";

/** Presentation behavior only. Stage 2 will supply authoritative biological state. */
export class PreviewDirector {
  time = 0;
  actionTime = 0;
  action: Action = "observe";
  automatic = true;
  paused = false;
  x = 0;
  z = 0;
  heading = 0;
  private targetX = 0;
  private targetZ = 0;
  private nextAction = 7;
  private sequence = 0;
  private readonly sequenceActions: Action[] = [
    "walk",
    "observe",
    "walk",
    "eat",
    "rest",
    "observe",
  ];

  setAction(action: Action, automatic = false) {
    this.automatic = automatic;
    this.action = action;
    this.actionTime = 0;
    if (action === "walk") {
      this.targetX = this.sequence % 2 ? 1.4 : -0.9;
      this.targetZ = this.sequence % 2 ? 0.35 : -0.55;
      if (Math.hypot(this.targetX - this.x, this.targetZ - this.z) < 0.15) {
        this.targetX = -this.targetX;
        this.targetZ = -this.targetZ;
      }
    }
    this.nextAction = action === "rest" ? 9 : action === "eat" ? 6 : 7;
  }
  reset() {
    this.time =
      this.actionTime =
      this.x =
      this.z =
      this.heading =
      this.sequence =
        0;
    this.automatic = true;
    this.paused = false;
    this.setAction("observe", true);
  }
  tick(delta: number, size: number): CreaturePose {
    if (this.paused)
      return {
        time: this.time,
        delta: 0,
        action: this.action,
        actionTime: this.actionTime,
        x: this.x,
        z: this.z,
        heading: this.heading,
      };
    this.time += delta;
    this.actionTime += delta;
    if (this.automatic && this.actionTime >= this.nextAction) {
      this.setAction(
        this.sequenceActions[this.sequence % this.sequenceActions.length],
        true,
      );
      this.sequence++;
    }
    if (this.action === "walk") {
      const dx = this.targetX - this.x,
        dz = this.targetZ - this.z,
        distance = Math.hypot(dx, dz);
      if (distance > 0.015) {
        const targetHeading = Math.atan2(dx, dz);
        const angle = Math.atan2(
          Math.sin(targetHeading - this.heading),
          Math.cos(targetHeading - this.heading),
        );
        this.heading += angle * Math.min(1, delta * 5);
        const step = Math.min(distance, delta * 0.25 * (0.8 + size * 0.4));
        if (Math.abs(angle) < 0.45) {
          this.x += (dx / distance) * step;
          this.z += (dz / distance) * step;
        }
      } else if (this.automatic) this.nextAction = this.actionTime;
      else this.setAction("observe");
    }
    return {
      time: this.time,
      delta,
      action: this.action,
      actionTime: this.actionTime,
      x: this.x,
      z: this.z,
      heading: this.heading,
    };
  }
}
