import type { SampledPortrait } from "./imageSampler";

export type ParticleAttributeBuffers = {
  /** Portrait position in world units (xyz). */
  aOrigin: Float32Array;
  /** Random spawn position in world units (xyz). */
  aSpawn: Float32Array;
  /** Initial velocity (xyz). */
  aVelocity: Float32Array;
  /** Constant acceleration (xyz). */
  aAcceleration: Float32Array;
  /** Random seed (1 float per particle). */
  aSeed: Float32Array;
  /** Base point size (1 float per particle). */
  aSize: Float32Array;
  /** Base opacity multiplier (1 float per particle). */
  aOpacity: Float32Array;
  /** Packed RGBA color (rgba). */
  aColor: Float32Array;
};

export type ParticleGenerationOptions = {
  /**
   * Seed for deterministic generation. Use the same seed to keep stable particle identity.
   * This should generally match the image sampling seed for best stability.
   */
  seed?: number;
  /**
   * Scatter radius for the intro spawn cloud (world units).
   * Particles spawn in a loosely spherical volume.
   */
  spawnRadius?: number;
  /**
   * Z-depth range for spawn positions (world units).
   */
  spawnDepth?: number;
  /**
   * Velocity magnitude range for intro flight (world units / second-ish).
   * Actual motion is shader-controlled, but these values shape the cinematic feel.
   */
  velocityRange?: readonly [number, number];
  /**
   * Acceleration magnitude range (world units / second^2-ish).
   * Use small values; shader will blend this into assembly/dissolve.
   */
  accelerationRange?: readonly [number, number];
  /**
   * Base particle size range (pixels in screen space, used by shader).
   */
  sizeRange?: readonly [number, number];
  /**
   * Base opacity range (multiplier).
   */
  opacityRange?: readonly [number, number];
  /**
   * Randomly nudge origin positions slightly to break perfect grid alignment.
   * This is applied in world units (not pixels).
   */
  originJitter?: number;
};

const DEFAULTS: Required<
  Pick<
    ParticleGenerationOptions,
    | "seed"
    | "spawnRadius"
    | "spawnDepth"
    | "velocityRange"
    | "accelerationRange"
    | "sizeRange"
    | "opacityRange"
    | "originJitter"
  >
> = {
  seed: 1337,
  spawnRadius: 2.25,
  spawnDepth: 2.5,
  velocityRange: [0.2, 1.4],
  accelerationRange: [0.0, 0.35],
  sizeRange: [1.0, 3.2],
  opacityRange: [0.75, 1.0],
  originJitter: 0.0,
};

/**
 * Generate per-particle attribute buffers to upload into `THREE.BufferAttributes`.
 *
 * Designed to be called once at init time:
 * - No per-frame allocations.
 * - Deterministic random generation for stable results across reloads.
 */
export function generateParticleAttributes(
  portrait: SampledPortrait,
  options: ParticleGenerationOptions = {}
): ParticleAttributeBuffers {
  const opts = { ...DEFAULTS, ...options };
  const n = portrait.count;

  const aOrigin = new Float32Array(n * 3);
  const aSpawn = new Float32Array(n * 3);
  const aVelocity = new Float32Array(n * 3);
  const aAcceleration = new Float32Array(n * 3);
  const aSeed = new Float32Array(n);
  const aSize = new Float32Array(n);
  const aOpacity = new Float32Array(n);
  const aColor = new Float32Array(n * 4);

  // Copy portrait colors verbatim (already normalized [0..1]).
  aColor.set(portrait.colors);

  const originJitter = Math.max(0, opts.originJitter);
  const velMin = opts.velocityRange[0];
  const velMax = opts.velocityRange[1];
  const accMin = opts.accelerationRange[0];
  const accMax = opts.accelerationRange[1];
  const sizeMin = opts.sizeRange[0];
  const sizeMax = opts.sizeRange[1];
  const opMin = opts.opacityRange[0];
  const opMax = opts.opacityRange[1];

  for (let i = 0; i < n; i++) {
    const base3 = i * 3;
    const base4 = i * 4;

    // Stable seed in [0..1).
    const s = hash01((i + 1) ^ opts.seed);
    aSeed[i] = s;

    // Origin (portrait) position.
    // Optional jitter to soften perfect pixel grid look.
    {
      const jx =
        originJitter === 0
          ? 0
          : (hash01((i + 11) ^ opts.seed) - 0.5) * originJitter;
      const jy =
        originJitter === 0
          ? 0
          : (hash01((i + 23) ^ opts.seed) - 0.5) * originJitter;
      aOrigin[base3 + 0] = portrait.positions[base3 + 0] + jx;
      aOrigin[base3 + 1] = portrait.positions[base3 + 1] + jy;
      aOrigin[base3 + 2] = portrait.positions[base3 + 2];
    }

    // Random spawn position: sample a sphere-ish volume with mild bias toward edges
    // to feel like a cinematic "space dust" scatter.
    {
      const u = hash01((i + 101) ^ opts.seed);
      const v = hash01((i + 131) ^ opts.seed);
      const w = hash01((i + 151) ^ opts.seed);

      const theta = u * Math.PI * 2.0;
      const phi = Math.acos(2.0 * v - 1.0);
      // Bias radius toward outer shell for more dramatic motion.
      const r = opts.spawnRadius * Math.pow(w, 0.35);

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta);
      const z =
        (hash01((i + 181) ^ opts.seed) - 0.5) * Math.max(0.0001, opts.spawnDepth);

      aSpawn[base3 + 0] = x;
      aSpawn[base3 + 1] = y;
      aSpawn[base3 + 2] = z;
    }

    // Velocity and acceleration: random directions with magnitudes in ranges.
    // Direction is biased slightly "toward the portrait center" to reinforce assembly.
    {
      // Random direction.
      const u = hash01((i + 401) ^ opts.seed);
      const v = hash01((i + 431) ^ opts.seed);
      const theta = u * Math.PI * 2.0;
      const z = v * 2.0 - 1.0;
      const t = Math.sqrt(Math.max(0, 1.0 - z * z));
      let dx = t * Math.cos(theta);
      let dy = t * Math.sin(theta);
      let dz = z;

      // Bias direction a bit toward the origin position (portrait) from spawn.
      // This creates "intent" without making motion uniform.
      const toOx = aOrigin[base3 + 0] - aSpawn[base3 + 0];
      const toOy = aOrigin[base3 + 1] - aSpawn[base3 + 1];
      const toOz = aOrigin[base3 + 2] - aSpawn[base3 + 2];
      const toLen = Math.hypot(toOx, toOy, toOz) || 1;
      const bx = toOx / toLen;
      const by = toOy / toLen;
      const bz = toOz / toLen;

      const bias = 0.35;
      const biased = normalize3(
        dx + bx * bias,
        dy + by * bias,
        dz + bz * bias
      );
      dx = biased[0];
      dy = biased[1];
      dz = biased[2];

      const velMag = lerp(velMin, velMax, hash01((i + 461) ^ opts.seed));
      aVelocity[base3 + 0] = dx * velMag;
      aVelocity[base3 + 1] = dy * velMag;
      aVelocity[base3 + 2] = dz * velMag;

      // Acceleration in a different random direction; keep small.
      const u2 = hash01((i + 501) ^ opts.seed);
      const v2 = hash01((i + 531) ^ opts.seed);
      const theta2 = u2 * Math.PI * 2.0;
      const z2 = v2 * 2.0 - 1.0;
      const t2 = Math.sqrt(Math.max(0, 1.0 - z2 * z2));
      const ax = t2 * Math.cos(theta2);
      const ay = t2 * Math.sin(theta2);
      const az = z2;
      const accMag = lerp(accMin, accMax, hash01((i + 561) ^ opts.seed));
      aAcceleration[base3 + 0] = ax * accMag;
      aAcceleration[base3 + 1] = ay * accMag;
      aAcceleration[base3 + 2] = az * accMag;
    }

    // Size and opacity: add subtle variation.
    aSize[i] = lerp(sizeMin, sizeMax, hash01((i + 701) ^ opts.seed));
    aOpacity[i] = lerp(opMin, opMax, hash01((i + 731) ^ opts.seed));

    // Slightly boost particles near edges (from alpha) for better silhouette.
    // Use alpha channel stored in aColor[base4 + 3].
    const alpha = aColor[base4 + 3];
    const edgeBoost = smoothstep(0.15, 1.0, alpha);
    aSize[i] *= lerp(0.95, 1.15, edgeBoost);
  }

  return {
    aOrigin,
    aSpawn,
    aVelocity,
    aAcceleration,
    aSeed,
    aSize,
    aOpacity,
    aColor,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function normalize3(x: number, y: number, z: number): [number, number, number] {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

/**
 * Deterministic hash -> [0,1). Stable across sessions for the same input integer.
 */
function hash01(x: number): number {
  let v = x >>> 0;
  v ^= v >>> 16;
  v = Math.imul(v, 0x7feb352d);
  v ^= v >>> 15;
  v = Math.imul(v, 0x846ca68b);
  v ^= v >>> 16;
  return (v >>> 0) / 4294967296;
}

