// Particle portrait fragment shader
// Renders soft circular points with additive glow (bloom-friendly).

varying vec4 vColor;
varying float vOpacity;
varying float vGlow;

void main() {
  // gl_PointCoord is [0,1] across the point sprite.
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  // Hard discard outside circle for clean edges.
  if (dist > 0.5) {
    discard;
  }

  // Bright core + soft outer glow halo.
  float core = 1.0 - smoothstep(0.0, 0.22, dist);
  float halo = 1.0 - smoothstep(0.12, 0.5, dist);

  float alpha = (core * 0.85 + halo * 0.45 * vGlow) * vOpacity;

  // Boost color in the halo for bloom pickup.
  vec3 rgb = vColor.rgb * (1.0 + halo * 0.65 * vGlow);

  gl_FragColor = vec4(rgb, alpha);
}
