import * as THREE from "three";
import { DISSOLVE_NOISE_DEFAULTS, noiseGLSL } from "@/utils/noise";
import { fragmentShader, vertexShader } from "@/shaders/shaderSources";

/**
 * Uniform bag exposed to hooks for GSAP animation and per-frame updates.
 * Values are mutated in-place to avoid allocations each frame.
 */
export type ParticleUniforms = {
  uTime: THREE.IUniform<number>;
  uAssembly: THREE.IUniform<number>;
  uDissolve: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uPixelRatio: THREE.IUniform<number>;
  uPointScale: THREE.IUniform<number>;
  uNoiseScale: THREE.IUniform<number>;
  uCurlStrength: THREE.IUniform<number>;
  uTurbulenceStrength: THREE.IUniform<number>;
  uWindStrength: THREE.IUniform<number>;
  uNoiseOctaves: THREE.IUniform<number>;
};

export type ParticleMaterialOptions = {
  pointScale?: number;
  noiseScale?: number;
  curlStrength?: number;
  turbulenceStrength?: number;
  windStrength?: number;
  noiseOctaves?: number;
};

export type ParticleMaterialResult = {
  material: THREE.ShaderMaterial;
  uniforms: ParticleUniforms;
};

/**
 * Create a GPU ShaderMaterial for THREE.Points particle rendering.
 * Noise GLSL is prepended to the vertex shader for curl/turbulence dissolve.
 */
export function createParticleMaterial(
  options: ParticleMaterialOptions = {}
): ParticleMaterialResult {
  const uniforms: ParticleUniforms = {
    uTime: { value: 0 },
    uAssembly: { value: 0 },
    uDissolve: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: 1 },
    uPointScale: { value: options.pointScale ?? 1 },
    uNoiseScale: {
      value: options.noiseScale ?? DISSOLVE_NOISE_DEFAULTS.noiseScale,
    },
    uCurlStrength: {
      value: options.curlStrength ?? DISSOLVE_NOISE_DEFAULTS.curlStrength,
    },
    uTurbulenceStrength: {
      value:
        options.turbulenceStrength ??
        DISSOLVE_NOISE_DEFAULTS.turbulenceStrength,
    },
    uWindStrength: {
      value: options.windStrength ?? DISSOLVE_NOISE_DEFAULTS.windStrength,
    },
    uNoiseOctaves: {
      value: options.noiseOctaves ?? DISSOLVE_NOISE_DEFAULTS.noiseOctaves,
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: noiseGLSL + vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexColors: false,
  });

  return { material, uniforms };
}

/**
 * Update pixel ratio uniform when DPR changes (resize / display move).
 */
export function updatePixelRatio(
  uniforms: ParticleUniforms,
  pixelRatio: number
): void {
  uniforms.uPixelRatio.value = pixelRatio;
}
