/**
 * Shader sources bundled for Next.js static export (no GLSL loader required).
 * Canonical editable sources: shaders/vertex.glsl and shaders/fragment.glsl
 */

export const vertexShader = /* glsl */ `
attribute vec3 aSpawn;
attribute vec3 aVelocity;
attribute vec3 aAcceleration;
attribute float aSeed;
attribute float aSize;
attribute float aOpacity;
attribute vec4 aColor;

uniform float uTime;
uniform float uAssembly;
uniform float uDissolve;
uniform vec2 uMouse;
uniform float uPixelRatio;
uniform float uPointScale;
uniform float uNoiseScale;
uniform float uCurlStrength;
uniform float uTurbulenceStrength;
uniform float uWindStrength;
uniform int uNoiseOctaves;

varying vec4 vColor;
varying float vOpacity;
varying float vGlow;

float easeOutExpo(float t) {
  return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

float easeOutBack(float t) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0);
}

float assemblyEase(float t) {
  float e = easeOutExpo(t);
  float back = easeOutBack(t);
  return mix(e, back, 0.12);
}

vec3 applyIdleMotion(vec3 pos, float seed) {
  float phase = seed * 6.2831853;
  float breathe = sin(uTime * 1.15 + phase) * 0.009;
  float floatX = sin(uTime * 0.55 + phase * 1.7) * 0.004;
  float floatY = sin(uTime * 0.82 + phase * 2.3) * 0.006;
  float floatZ = cos(uTime * 0.63 + phase * 1.1) * 0.003;
  vec3 drift = vec3(floatX + breathe, floatY, floatZ + breathe * 0.4);
  vec2 parallax = uMouse * (0.04 + seed * 0.03);
  drift.xy += parallax;
  return pos + drift;
}

vec3 applyDissolve(vec3 pos, float seed, out float dissolveFade) {
  float d = clamp(uDissolve, 0.0, 1.0);
  if (d <= 0.0001) {
    dissolveFade = 1.0;
    return pos;
  }

  float stagger = smoothstep(0.0, 1.0, d * (1.15 + seed * 0.85) - seed * 0.25);
  float dActive = d * stagger;

  vec3 noisePos = pos * uNoiseScale + vec3(seed * 17.3, seed * 31.7, seed * 9.1);
  vec3 animPos = noisePos + vec3(0.0, uTime * 0.35, uTime * 0.22);

  vec3 curl = curlNoiseFbm(animPos, uNoiseOctaves) * uCurlStrength;
  float turb = turbulence(animPos * 0.8 + uTime * 0.18, uNoiseOctaves) * uTurbulenceStrength;
  vec3 wind = windField(pos, uTime, uWindStrength);

  float speedMul = 1.2 + seed * 2.8;
  vec3 velPush = aVelocity * dActive * speedMul;
  vec3 accPush = aAcceleration * dActive * dActive * 0.6;

  vec3 dissolveOffset = curl;
  dissolveOffset += vec3(turb * 0.6, turb, turb * 0.4);
  dissolveOffset += wind;
  dissolveOffset += velPush + accPush;
  dissolveOffset *= dActive * dActive * (1.8 + seed * 2.5);

  float angle = dActive * (seed - 0.5) * 8.0;
  float ca = cos(angle);
  float sa = sin(angle);
  vec2 swirled = mat2(ca, -sa, sa, ca) * pos.xy;
  vec3 outPos = pos + dissolveOffset;
  outPos.xy = mix(outPos.xy, swirled + dissolveOffset.xy, dActive * 0.35);
  outPos.y += dActive * dActive * (0.3 + seed * 0.7);

  dissolveFade = 1.0 - smoothstep(0.25, 1.0, dActive * (0.75 + seed * 0.55));
  return outPos;
}

void main() {
  vec3 origin = position;
  vec3 spawn = aSpawn;
  float seed = aSeed;

  float t = assemblyEase(clamp(uAssembly, 0.0, 1.0));
  vec3 pos = mix(spawn, origin, t);

  float flight = (1.0 - t) * (1.0 - t);
  pos += aVelocity * flight * 0.4;
  pos += aAcceleration * flight * 0.25;

  float idleWeight = smoothstep(0.85, 1.0, uAssembly) * (1.0 - smoothstep(0.0, 0.15, uDissolve));
  if (idleWeight > 0.001) {
    vec3 idlePos = applyIdleMotion(origin, seed);
    pos = mix(pos, idlePos, idleWeight);
  }

  float dissolveFade;
  pos = applyDissolve(pos, seed, dissolveFade);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float dist = max(0.1, -mvPosition.z);
  float sizeAtten = 280.0 / dist;
  float dissolveSize = 1.0 - uDissolve * (0.35 + seed * 0.4);
  gl_PointSize = aSize * uPixelRatio * uPointScale * sizeAtten * dissolveSize;
  gl_PointSize = max(gl_PointSize, 0.5);

  gl_Position = projectionMatrix * mvPosition;

  vColor = aColor;
  vOpacity = aOpacity * aColor.a * dissolveFade;
  vGlow = 0.6 + seed * 0.4;
}
`;

export const fragmentShader = /* glsl */ `
varying vec4 vColor;
varying float vOpacity;
varying float vGlow;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  if (dist > 0.5) {
    discard;
  }

  float core = 1.0 - smoothstep(0.0, 0.22, dist);
  float halo = 1.0 - smoothstep(0.12, 0.5, dist);
  float alpha = (core * 0.85 + halo * 0.45 * vGlow) * vOpacity;
  vec3 rgb = vColor.rgb * (1.0 + halo * 0.65 * vGlow);

  gl_FragColor = vec4(rgb, alpha);
}
`;
