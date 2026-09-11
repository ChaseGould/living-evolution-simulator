import { Engine, WebGPUEngine, type AbstractEngine } from "@babylonjs/core";
import { preferWebGPU, type RendererInfo } from "./renderer-policy";

export interface Renderer {
  engine: AbstractEngine;
  canvas: HTMLCanvasElement;
  backend: "WEBGPU" | "WEBGL";
  info: RendererInfo;
  fallbackReason?: string;
}

export async function createRenderer(
  initialCanvas: HTMLCanvasElement,
  forceWebGL = false,
): Promise<Renderer> {
  let canvas = initialCanvas;
  return preferWebGPU<Renderer>(
    !forceWebGL && "gpu" in navigator
      ? async () => {
          const candidate = new WebGPUEngine(canvas, {
            powerPreference: "high-performance",
            antialias: true,
            stencil: true,
          });
          try {
            await candidate.initAsync();
            return {
              engine: candidate,
              canvas,
              backend: "WEBGPU",
              info: candidate.getInfo(),
            };
          } catch (error) {
            // An attempted WebGPU context can prevent this canvas from acquiring WebGL.
            // Dispose partial resources, then use a fresh canvas for the fallback.
            try {
              candidate.dispose();
            } catch {
              /* Initialization may fail before a device exists. */
            }
            const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
            canvas.replaceWith(replacement);
            canvas = replacement;
            throw error;
          }
        }
      : undefined,
    (failure) => {
      const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        powerPreference: "high-performance",
      });
      return {
        engine,
        canvas,
        backend: "WEBGL",
        info: engine.getGlInfo(),
        fallbackReason: failure
          ? String(failure)
          : forceWebGL
            ? "Compatibility mode requested"
            : "WebGPU is unavailable in this browser",
      };
    },
  );
}
