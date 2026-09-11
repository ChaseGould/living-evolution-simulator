import test from "node:test";
import assert from "node:assert/strict";
import { preferWebGPU, rendererVendor } from "../src/renderer-policy.ts";

test("uses successful WebGPU without trying WebGL, regardless of adapter vendor", async () => {
  const adapter = { vendor: "amd" };
  assert.equal(
    await preferWebGPU(
      async () => adapter,
      () => {
        throw new Error("Unexpected fallback");
      },
    ),
    adapter,
  );
});
test("falls back after WebGPU rejects and preserves the failure reason", async () => {
  const error = new Error("No suitable adapter");
  assert.equal(
    await preferWebGPU(
      async () => {
        throw error;
      },
      (reason) => {
        assert.equal(reason, error);
        return "webgl";
      },
    ),
    "webgl",
  );
});
test("uses WebGL when WebGPU is unavailable, and propagates total startup failure", async () => {
  assert.equal(await preferWebGPU(undefined, () => "webgl"), "webgl");
  await assert.rejects(
    preferWebGPU(undefined, () => {
      throw new Error("No graphics context");
    }),
    /No graphics context/,
  );
});
test("labels the reported adapter rather than the requested performance preference", () => {
  const info = (vendor, renderer = "", version = "") => ({
    vendor,
    renderer,
    version,
  });
  assert.equal(rendererVendor(info("nvidia", "blackwell")), "NVIDIA GPU");
  assert.equal(rendererVendor(info("amd", "rdna2")), "AMD GPU");
  assert.equal(
    rendererVendor(
      info("", "ANGLE (Microsoft, Microsoft Basic Render Driver)"),
    ),
    "SOFTWARE RENDERING",
  );
  assert.equal(
    rendererVendor(info("", "ANGLE (NVIDIA, GeForce RTX 5060)")),
    "NVIDIA GPU",
  );
  assert.equal(
    rendererVendor(info("unknown vendor", "unknown renderer")),
    "GPU UNIDENTIFIED",
  );
});
