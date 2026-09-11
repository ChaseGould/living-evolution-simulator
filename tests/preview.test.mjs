import test from "node:test";
import assert from "node:assert/strict";
import { PreviewDirector } from "../src/preview.ts";

test("pause freezes time, position, and behavior even at an automatic transition", () => {
  const director = new PreviewDirector();
  director.tick(7, 0.5);
  director.paused = true;
  const before = director.tick(0, 0.5);
  for (let i = 0; i < 100; i++)
    assert.deepEqual(director.tick(0.05, 0.5), before);
});

test("manual walking reaches a bounded destination then returns to observe", () => {
  for (const size of [0, 0.5, 1]) {
    const director = new PreviewDirector();
    director.setAction("walk");
    for (let i = 0; i < 1000; i++) {
      const pose = director.tick(0.02, size);
      assert.ok(Number.isFinite(pose.heading));
      assert.ok(Math.hypot(pose.x, pose.z) <= 1.6);
    }
    assert.equal(director.action, "observe");
    assert.ok(Math.hypot(director.x + 0.9, director.z + 0.55) < 0.02);
  }
});

test("manual poses remain selected instead of advancing autonomously", () => {
  for (const action of ["observe", "rest", "eat"]) {
    const director = new PreviewDirector();
    director.setAction(action);
    for (let i = 0; i < 1000; i++) director.tick(0.05, 0.5);
    assert.equal(director.action, action);
    assert.equal(director.x, 0);
    assert.equal(director.z, 0);
  }
});

test("reset restores founder observation after moving and pausing", () => {
  const director = new PreviewDirector();
  director.setAction("walk");
  for (let i = 0; i < 100; i++) director.tick(0.02, 0.5);
  director.paused = true;
  director.reset();
  assert.equal(director.time, 0);
  assert.equal(director.x, 0);
  assert.equal(director.z, 0);
  assert.equal(director.heading, 0);
  assert.equal(director.action, "observe");
  assert.equal(director.automatic, true);
  assert.equal(director.paused, false);
});
