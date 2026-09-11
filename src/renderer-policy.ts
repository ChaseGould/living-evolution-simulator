export interface RendererInfo {
  vendor: string;
  renderer: string;
  version: string;
}

export function rendererVendor(info: RendererInfo): string {
  const name = `${info.vendor} ${info.renderer} ${info.version}`;
  if (/swiftshader|software|llvmpipe|basic render|\bwarp\b/i.test(name))
    return "SOFTWARE RENDERING";
  if (/nvidia|\b0x10de\b/i.test(name)) return "NVIDIA GPU";
  if (/amd|radeon|\b0x1002\b/i.test(name)) return "AMD GPU";
  if (/intel|\b0x8086\b/i.test(name)) return "INTEL GPU";
  return "GPU UNIDENTIFIED";
}

/** Startup fallback only; successful WebGPU initialization does not guarantee a particular vendor. */
export async function preferWebGPU<T>(
  webgpu: (() => Promise<T>) | undefined,
  webgl: (failure?: unknown) => T,
): Promise<T> {
  if (webgpu) {
    try {
      return await webgpu();
    } catch (error) {
      return webgl(error);
    }
  }
  return webgl();
}
