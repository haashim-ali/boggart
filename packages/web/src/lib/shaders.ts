export const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Simplex-style 3D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

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

// Fractional Brownian Motion
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    val += amp * snoise(p * freq);
    freq *= 2.1;
    amp *= 0.48;
    p += vec3(1.7, 9.2, 2.8);
  }
  return val;
}

// Domain-warped FBM
float warpedFbm(vec3 p) {
  vec3 q = vec3(
    fbm(p + vec3(0.0, 0.0, 0.0)),
    fbm(p + vec3(5.2, 1.3, 2.1)),
    0.0
  );
  vec3 r = vec3(
    fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.0)),
    fbm(p + 4.0 * q + vec3(8.3, 2.8, 0.0)),
    0.0
  );
  return fbm(p + 3.5 * r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uvAspect = vec2(uv.x * aspect, uv.y);
  vec2 mouseNorm = u_mouse;
  vec2 mouseAspect = vec2(mouseNorm.x * aspect, mouseNorm.y);

  // Mirror reflection
  vec2 mirrorUV = uv;
  mirrorUV.y = 0.5 + abs(uv.y - 0.5);
  vec2 mirrorUV2 = uv;
  mirrorUV2.y = 0.5 - abs(uv.y - 0.5);
  float mirrorBlend = smoothstep(0.48, 0.3, uv.y) * 0.55;

  // Mouse influence
  float influence = 0.6;
  vec2 towardMouse = (mouseNorm - 0.5) * influence;
  vec2 noiseCoord = mix(uv, mirrorUV, mirrorBlend * 0.5) + towardMouse;

  // Domain-warped FBM
  float t = u_time * 0.06;
  vec3 p = vec3(noiseCoord * 1.4, t);
  float nWarp = warpedFbm(p) * 0.5 + 0.5;

  // Finer detail layer
  float nDetail = fbm(vec3(noiseCoord * 3.2, t * 1.4 + 10.0)) * 0.5 + 0.5;

  // Slow huge background drift
  float nDrift = snoise(vec3(noiseCoord * 0.5, t * 0.4 + 20.0)) * 0.5 + 0.5;

  // Combine layers
  float n = nWarp * 0.55 + nDetail * 0.25 + nDrift * 0.2;

  // Mirror reflection noise
  vec3 mirrorSample = vec3(mirrorUV2 * 1.4 + towardMouse, t * 0.85);
  float nMirror = warpedFbm(mirrorSample) * 0.5 + 0.5;
  n = mix(n, nMirror, mirrorBlend);

  // Vortex around mouse
  vec2 toFrag = uv - mouseNorm;
  float dist = length(toFrag);
  float vortexRadius = 0.5;
  float vortexStr = 0.1 * exp(-dist * dist / (vortexRadius * vortexRadius));
  float angle = atan(toFrag.y, toFrag.x);
  angle += vortexStr * 1.5 * (1.0 - smoothstep(0.0, vortexRadius, dist));
  vec2 vortexUV = mouseNorm + vec2(cos(angle), sin(angle)) * dist;
  float nVortex = warpedFbm(vec3(vortexUV * 1.4, t * 0.9)) * 0.5 + 0.5;
  n = mix(n, nVortex, vortexStr * 1.8);

  // Mouse ripples
  float distAspect = length(uvAspect - mouseAspect);
  float ripple1 = sin(distAspect * 40.0 - u_time * 1.2) * exp(-distAspect * 3.5);
  float ripple2 = sin(distAspect * 55.0 - u_time * 0.8 + 1.5) * exp(-distAspect * 4.0);
  float ripple = (ripple1 * 0.6 + ripple2 * 0.4) * 0.022;

  // Reflective sheen
  float sheen1 = pow(max(0.0, snoise(vec3(uv * 3.5, u_time * 0.1))), 3.0);
  float sheen2 = pow(max(0.0, snoise(vec3(mirrorUV2 * 2.8, u_time * 0.08 + 5.0))), 3.0);
  float sheen = sheen1 * 0.6 + sheen2 * mirrorBlend * 0.4;

  // Energy veins
  float veins = abs(snoise(vec3(noiseCoord * 4.0, t * 1.2)));
  veins = pow(1.0 - veins, 7.0) * 0.08;

  // Mirror seam
  float seamGlow = exp(-abs(uv.y - 0.5) * 18.0) * 0.06;
  seamGlow *= 0.7 + 0.3 * sin(uv.x * 16.0 + u_time * 0.3);

  // Palette
  vec3 dark = vec3(0.02, 0.025, 0.04);
  vec3 tint = vec3(0.42, 0.4, 0.62);
  vec3 tintBright = vec3(0.55, 0.5, 0.75);
  vec3 sheenColor = vec3(0.6, 0.55, 0.8);
  vec3 rippleTint = vec3(0.4, 0.42, 0.6);
  vec3 seamColor = vec3(0.5, 0.48, 0.7);
  vec3 veinColor = vec3(0.5, 0.55, 0.8);

  float strength = 0.22;
  vec3 col = dark + strength * n * tint;
  col += ripple * rippleTint;
  col += sheen * 0.06 * sheenColor;
  col += seamGlow * seamColor;
  col += veins * veinColor;

  // Breathing pulse
  float pulse = 0.5 + 0.5 * sin(u_time * 0.2);
  col += 0.01 * pulse * tintBright;

  // Ambient drift waves
  float wave = 0.5 + 0.5 * sin(noiseCoord.x * 4.0 + u_time * 0.2) * sin(noiseCoord.y * 4.0 + u_time * 0.15);
  col += 0.025 * wave * tint;

  gl_FragColor = vec4(col, 1.0);
}
`;
