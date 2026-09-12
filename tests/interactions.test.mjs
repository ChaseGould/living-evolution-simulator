import test from "node:test";
import assert from "node:assert/strict";
import { PreviewDirector } from "../src/preview.ts";

test("forage and drink finish their ordered phases at every body size", () => {
  for (const action of ["forage", "drink"])
    for (const size of [0, 0.5, 1]) {
      const d = new PreviewDirector();
      d.setAction(action);
      const phases = [];
      let carried = false;
      let settled;
      for (let i = 0; i < 2400 && d.action === action; i++) {
        const p = d.tick(1 / 60, size);
        assert.ok(Math.hypot(p.x, p.z) < 1.6);
        assert.ok(p.interaction >= 0 && p.interaction <= 1);
        if (p.action !== action) break;
        if (phases.at(-1) !== p.phase) phases.push(p.phase);
        carried ||= p.carrying;
        if (p.phase !== "approach") {
          settled ??= [p.x, p.z, p.heading];
          assert.deepEqual(
            [p.x, p.z, p.heading],
            settled,
            "stationary during interaction",
          );
          assert.equal(p.moving, false);
        }
      }
      assert.deepEqual(
        phases,
        action === "forage"
          ? ["approach", "search", "enter", "perform", "exit"]
          : ["approach", "enter", "perform", "exit"],
      );
      assert.equal(d.action, "observe");
      assert.equal(d.carrying, false);
      assert.equal(carried, action === "forage");
    }
});

test("pausing freezes every phase and manual interruption safely exits", () => {
  for (const action of ["forage", "drink"])
    for (const phase of ["approach", "enter", "perform", "exit"]) {
      const d = new PreviewDirector();
      d.setAction(action);
      for (let i = 0; i < 2000 && d.phase !== phase; i++) d.tick(0.02, 0.5);
      assert.equal(d.phase, phase);
      d.paused = true;
      const frozen = d.tick(0, 0.5);
      assert.deepEqual(d.tick(10, 0.5), frozen);
      d.paused = false;
      d.setAction("walk");
      if (phase !== "approach") assert.equal(d.phase, "exit");
      for (let i = 0; i < 100; i++) d.tick(0.02, 0.5);
      assert.equal(d.action, "walk");
      assert.equal(d.carrying, false);
      d.reset();
      assert.equal(d.interaction, 0);
      assert.equal(d.action, "observe");
    }
});

test("automatic sequences agree across render frequencies and include habitat actions", () => {
  const runs = [30, 60, 120].map((fps) => {
    const d = new PreviewDirector();
    const actions = new Set();
    for (let i = 0; i < fps * 90; i++) {
      d.tick(1 / fps, 0.5);
      actions.add(d.action);
    }
    assert.ok(
      actions.has("forage") && actions.has("drink") && actions.has("walk"),
    );
    return d.tick(0, 0.5);
  });
  assert.deepEqual(runs[0], runs[1]);
  assert.deepEqual(runs[1], runs[2]);
});
