/**
 * Noise utilities for the particle portrait engine.
 *
 * Provides:
 * - A self-contained GLSL noise library (simplex, curl, turbulence) for ShaderMaterial.
 * - Matching CPU implementations for deterministic previews and uniform packing.
 *
 * The dissolve animation runs entirely on the GPU; this module supplies the math.
 */

// ---------------------------------------------------------------------------
// GLSL library (injected into vertex/fragment shaders via ShaderMaterial)
// ---------------------------------------------------------------------------

/**
 * GLSL 3.0 noise functions: simplex 3D, FBM turbulence, and curl noise.
 * Prepend this block before your main shader source.
 */
export const noiseGLSL = /* glsl */ `
// --- Permutation tables (simplex 3D) ---
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 taylorInvSqrt(vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float snoise(vec2 v) {
  return snoise(vec3(v.x, v.y, 0.0));
}

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float turbulence(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * abs(snoise(p * frequency));
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec3 curlNoise(vec3 p) {
  const float e = 0.001;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));

  float x = n3 - n4 - n1 + n2;
  float y = n5 - n6;
  float z = n1 - n2;
  return vec3(x, y, z) / (2.0 * e);
}

vec3 curlNoiseFbm(vec3 p, int octaves) {
  vec3 curl = vec3(0.0);
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    curl += amplitude * curlNoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return curl;
}

vec3 windField(vec3 p, float time, float strength) {
  vec3 flow = vec3(
    snoise(vec3(p.x * 0.4, p.y * 0.4, time * 0.15)),
    snoise(vec3(p.y * 0.4, p.z * 0.4, time * 0.12 + 17.0)),
    snoise(vec3(p.z * 0.4, p.x * 0.4, time * 0.18 + 31.0))
  );
  return flow * strength;
}
`;

// ---------------------------------------------------------------------------
// CPU simplex 3D (Ashima / Gustavson, MIT license)
// ---------------------------------------------------------------------------

const GRAD3: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

const PERM = new Uint8Array(512);
const PERM_MOD12 = new Uint8Array(512);

(function initPermutation() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Deterministic shuffle (LCG).
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
    PERM_MOD12[i] = PERM[i] % 12;
  }
})();

function dot3(
  g: readonly [number, number, number],
  x: number,
  y: number,
  z: number
): number {
  return g[0] * x + g[1] * y + g[2] * z;
}

/**
 * 3D simplex noise in range approximately [-1, 1].
 */
export function simplex3(x: number, y: number, z: number): number {
  const F3 = 1 / 3;
  const G3 = 1 / 6;

  const s = (x + y + z) * F3;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const k = Math.floor(z + s);

  const t = (i + j + k) * G3;
  const X0 = x - (i - t);
  const Y0 = y - (j - t);
  const Z0 = z - (k - t);

  let i1: number;
  let j1: number;
  let k1: number;
  let i2: number;
  let j2: number;
  let k2: number;

  if (X0 >= Y0) {
    if (Y0 >= Z0) {
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    } else if (X0 >= Z0) {
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    }
  } else {
    if (Y0 < Z0) {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else if (X0 < Z0) {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    }
  }

  const X1 = X0 - i1 + G3;
  const Y1 = Y0 - j1 + G3;
  const Z1 = Z0 - k1 + G3;
  const X2 = X0 - i2 + 2 * G3;
  const Y2 = Y0 - j2 + 2 * G3;
  const Z2 = Z0 - k2 + 2 * G3;
  const X3 = X0 - 1 + 3 * G3;
  const Y3 = Y0 - 1 + 3 * G3;
  const Z3 = Z0 - 1 + 3 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  let n0 = 0;
  let n1 = 0;
  let n2 = 0;
  let n3 = 0;

  let t0 = 0.6 - X0 * X0 - Y0 * Y0 - Z0 * Z0;
  if (t0 > 0) {
    t0 *= t0;
    const gi = PERM_MOD12[ii + PERM[jj + PERM[kk]]];
    n0 = t0 * t0 * dot3(GRAD3[gi], X0, Y0, Z0);
  }

  let t1 = 0.6 - X1 * X1 - Y1 * Y1 - Z1 * Z1;
  if (t1 > 0) {
    t1 *= t1;
    const gi = PERM_MOD12[ii + i1 + PERM[jj + j1 + PERM[kk + k1]]];
    n1 = t1 * t1 * dot3(GRAD3[gi], X1, Y1, Z1);
  }

  let t2 = 0.6 - X2 * X2 - Y2 * Y2 - Z2 * Z2;
  if (t2 > 0) {
    t2 *= t2;
    const gi = PERM_MOD12[ii + i2 + PERM[jj + j2 + PERM[kk + k2]]];
    n2 = t2 * t2 * dot3(GRAD3[gi], X2, Y2, Z2);
  }

  let t3 = 0.6 - X3 * X3 - Y3 * Y3 - Z3 * Z3;
  if (t3 > 0) {
    t3 *= t3;
    const gi = PERM_MOD12[ii + 1 + PERM[jj + 1 + PERM[kk + 1]]];
    n3 = t3 * t3 * dot3(GRAD3[gi], X3, Y3, Z3);
  }

  return 32 * (n0 + n1 + n2 + n3);
}

/**
 * Fractional Brownian motion built from simplex noise.
 */
export function fbm3(
  x: number,
  y: number,
  z: number,
  octaves = 4
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplex3(x * frequency, y * frequency, z * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * Turbulence: FBM using absolute noise values.
 */
export function turbulence3(
  x: number,
  y: number,
  z: number,
  octaves = 4
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value +=
      amplitude *
      Math.abs(simplex3(x * frequency, y * frequency, z * frequency));
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value;
}

/**
 * Curl of the simplex noise field (finite-difference gradient).
 */
export function curl3(x: number, y: number, z: number): [number, number, number] {
  const e = 0.001;
  const n1 = simplex3(x, y + e, z);
  const n2 = simplex3(x, y - e, z);
  const n3 = simplex3(x, y, z + e);
  const n4 = simplex3(x, y, z - e);
  const n5 = simplex3(x + e, y, z);
  const n6 = simplex3(x - e, y, z);

  const cx = n3 - n4 - n1 + n2;
  const cy = n5 - n6;
  const cz = n1 - n2;
  const inv = 1 / (2 * e);
  return [cx * inv, cy * inv, cz * inv];
}

/**
 * Multi-octave curl noise for richer dissolve motion.
 */
export function curlFbm3(
  x: number,
  y: number,
  z: number,
  octaves = 3
): [number, number, number] {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    const [dx, dy, dz] = curl3(x * frequency, y * frequency, z * frequency);
    cx += dx * amplitude;
    cy += dy * amplitude;
    cz += dz * amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }
  return [cx, cy, cz];
}

/**
 * Animated wind vector field (CPU mirror of the GLSL `windField`).
 */
export function windField3(
  x: number,
  y: number,
  z: number,
  time: number,
  strength = 1
): [number, number, number] {
  return [
    simplex3(x * 0.4, y * 0.4, time * 0.15) * strength,
    simplex3(y * 0.4, z * 0.4, time * 0.12 + 17) * strength,
    simplex3(z * 0.4, x * 0.4, time * 0.18 + 31) * strength,
  ];
}

/** Default dissolve noise parameters (mirrored as shader uniforms). */
export const DISSOLVE_NOISE_DEFAULTS = {
  curlStrength: 1.8,
  turbulenceStrength: 0.9,
  windStrength: 0.45,
  noiseScale: 1.6,
  noiseOctaves: 4,
} as const;
