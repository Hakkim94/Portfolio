export type ImageSamplerOptions = {
  /**
   * Ignore pixels with alpha <= this threshold (0..1).
   * For portraits with anti-aliased edges, something like 0.05–0.15 works well.
   */
  alphaThreshold?: number;
  /**
   * Maximum number of sampled particles. If the image contains more visible pixels,
   * a deterministic (seeded) probability sampling is applied.
   */
  maxParticles?: number;
  /**
   * Seed for deterministic sampling. Same seed => stable particle identity.
   */
  seed?: number;
  /**
   * Final portrait size in world units (height). Width scales by image aspect.
   * This is just a coordinate transform; the GPU will do the animation.
   */
  height?: number;
  /**
   * Center offset in world units.
   */
  center?: readonly [number, number];
  /**
   * Add a small within-pixel jitter (world units) to reduce visible grid patterns.
   * Set to 0 for perfectly crisp pixel placement.
   */
  jitter?: number;
};

export type SampledPortrait = {
  /** Number of particles (visible pixels after sampling). */
  count: number;
  /** Image width/height in pixels. */
  imageWidth: number;
  imageHeight: number;
  /**
   * Packed RGB(A) colors per particle, normalized to 0..1.
   * Layout: [r,g,b,a, r,g,b,a, ...]
   */
  colors: Float32Array;
  /**
   * Packed portrait positions in world units (z is 0).
   * Layout: [x,y,z, x,y,z, ...]
   */
  positions: Float32Array;
};

type RGBAImageData = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

const DEFAULTS: Required<
  Pick<
    ImageSamplerOptions,
    "alphaThreshold" | "maxParticles" | "seed" | "height" | "center" | "jitter"
  >
> = {
  alphaThreshold: 0.1,
  maxParticles: 80000,
  seed: 1337,
  height: 1.6,
  center: [0, 0],
  jitter: 0.0,
};

/**
 * Load an image from a URL (e.g. `/images/me.png`) and sample only visible pixels.
 * The output is ready to be uploaded into `BufferAttributes` for `THREE.Points`.
 *
 * Notes:
 * - This uses an offscreen 2D canvas purely for pixel decoding (not for rendering particles).
 * - Designed for static export: loads from your `public/` folder via a relative URL.
 */
export async function samplePortraitFromUrl(
  url: string,
  options: ImageSamplerOptions = {}
): Promise<SampledPortrait> {
  const opts = { ...DEFAULTS, ...options };
  const img = await decodeImageToRGBA(url);
  return sampleVisiblePixels(img, opts);
}

function sampleVisiblePixels(
  img: RGBAImageData,
  opts: Required<ImageSamplerOptions>
): SampledPortrait {
  const { width, height, data } = img;
  const alphaThr = Math.max(0, Math.min(1, opts.alphaThreshold));
  const alphaThrByte = Math.floor(alphaThr * 255);

  // Pass 1: count visible pixels (alpha threshold).
  let visible = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > alphaThrByte) visible++;
  }

  // If fully transparent, return empty arrays but keep metadata sane.
  if (visible === 0) {
    return {
      count: 0,
      imageWidth: width,
      imageHeight: height,
      colors: new Float32Array(0),
      positions: new Float32Array(0),
    };
  }

  const targetMax = Math.max(1, Math.floor(opts.maxParticles));
  const keepProb = Math.min(1, targetMax / visible);

  // Pass 2: count samples (deterministically) so we can allocate exact buffers once.
  let count = 0;
  {
    let pixelIndex = 0; // increments over all pixels (not only visible)
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = (row + x) * 4;
        const a = data[idx + 3];
        if (a > alphaThrByte) {
          const r = hash01(pixelIndex ^ opts.seed);
          if (r < keepProb) count++;
        }
        pixelIndex++;
      }
    }
  }

  // Exact allocations (no resize, no per-frame allocations).
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 4);

  const aspect = width / height;
  const worldH = opts.height;
  const worldW = worldH * aspect;
  const halfW = worldW * 0.5;
  const halfH = worldH * 0.5;
  const centerX = opts.center[0];
  const centerY = opts.center[1];
  const jitter = Math.max(0, opts.jitter);

  // Fill packed arrays.
  let out = 0;
  let pixelIndex = 0;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = (row + x) * 4;
      const a = data[idx + 3];
      if (a <= alphaThrByte) {
        pixelIndex++;
        continue;
      }

      const r = hash01(pixelIndex ^ opts.seed);
      if (r >= keepProb) {
        pixelIndex++;
        continue;
      }

      // Map pixel to world coordinates.
      // X: left(-) to right(+), Y: bottom(-) to top(+)
      const nx = (x + 0.5) / width; // 0..1
      const ny = 1.0 - (y + 0.5) / height; // 0..1 (flip so image is upright)

      // Optional within-pixel jitter (deterministic).
      const jx = jitter === 0 ? 0 : (hash01((pixelIndex + 1) ^ opts.seed) - 0.5) * jitter;
      const jy = jitter === 0 ? 0 : (hash01((pixelIndex + 2) ^ opts.seed) - 0.5) * jitter;

      const px = (nx * worldW - halfW) + centerX + jx;
      const py = (ny * worldH - halfH) + centerY + jy;

      const pBase = out * 3;
      positions[pBase + 0] = px;
      positions[pBase + 1] = py;
      positions[pBase + 2] = 0;

      const cBase = out * 4;
      colors[cBase + 0] = data[idx + 0] / 255;
      colors[cBase + 1] = data[idx + 1] / 255;
      colors[cBase + 2] = data[idx + 2] / 255;
      colors[cBase + 3] = data[idx + 3] / 255;

      out++;
      pixelIndex++;
    }
  }

  return {
    count,
    imageWidth: width,
    imageHeight: height,
    colors,
    positions,
  };
}

async function decodeImageToRGBA(url: string): Promise<RGBAImageData> {
  // Prefer fetch+blob to ensure compatibility with static export basePaths and cache.
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load image: ${url} (${res.status} ${res.statusText})`);
  }
  const blob = await res.blob();

  // decode: ImageBitmap when available (fast, avoids DOM <img> decode layout)
  const bitmap = await createImageBitmap(blob);
  const w = bitmap.width;
  const h = bitmap.height;

  // Use OffscreenCanvas when possible (workers / better perf),
  // otherwise fall back to a normal canvas.
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement("canvas"), { width: w, height: h });

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not get 2D context to read image pixels.");
  }

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);

  // Free bitmap memory ASAP (especially important on mobile).
  bitmap.close();

  return { width: w, height: h, data: imageData.data };
}

/**
 * Deterministic hash -> [0,1). Stable across sessions for the same input integer.
 * This is fast and good enough for sampling + per-pixel jitter.
 */
function hash01(x: number): number {
  // Force to uint32
  let v = x >>> 0;
  // Mix (xorshift-like + avalanching)
  v ^= v >>> 16;
  v = Math.imul(v, 0x7feb352d);
  v ^= v >>> 15;
  v = Math.imul(v, 0x846ca68b);
  v ^= v >>> 16;
  // Convert to [0,1)
  return (v >>> 0) / 4294967296;
}

