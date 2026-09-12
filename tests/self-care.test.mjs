import test from "node:test";
import assert from "node:assert/strict";
import { PreviewDirector } from "../src/preview.ts";

test("self care actions complete, pause in every phase, and remain bounded", () => {
  for (const action of ["groom", "sleep", "startle"]) {
    for (const size of [0, 0.5, 1]) {
      const d = new PreviewDirector();
      d.setAction(action);
      const phases = new Set();
      for (let i = 0; i < 1500 && d.action === action; i++) {
        const p = d.tick(1 / 60, size);
        if (p.action !== action) break;
        phases.add(p.phase);
        assert.ok(p.interaction >= 0 && p.interaction <= 1);
        assert.ok(Math.hypot(p.x, p.z) < 0.25);
        d.paused = true;
        assert.deepEqual(d.tick(10, size), d.tick(0, size));
        d.paused = false;
      }
      assert.deepEqual([...phases], ["enter", "perform", "exit"]);
      assert.equal(d.action, "observe");
    }
  }
});

test("startle safely interrupts food, water and sleep, with last request winning", () => {
  for (const action of ["eat", "forage", "drink", "sleep", "groom"]) {
    const d = new PreviewDirector();
    d.setAction(action);
    for (let i = 0; i < 3000 && d.phase !== "perform"; i++) d.tick(1 / 60, 0.5);
    d.tick(0.5, 0.5);
    d.setAction("startle");
    assert.equal(d.phase, "exit");
    for (let i = 0; i < 240; i++) d.tick(1 / 60, 0.5);
    assert.equal(d.action, "startle");
    assert.equal(d.carrying, false);
    d.setAction("groom");
    d.setAction("walk");
    for (let i = 0; i < 100; i++) d.tick(1 / 60, 0.5);
    assert.equal(d.action, "walk");
    d.reset();
    assert.equal(d.action, "observe");
    assert.equal(d.interaction, 0);
    assert.equal(d.carrying, false);
  }
});
