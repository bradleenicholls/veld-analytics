// Veld Analytics — 3D concept, homepage hero
// Vanilla JS port of react-bits' "Galaxy" background effect, replacing
// Topography (the previous hero background — felt too busy with its
// morphing contour lines, glow and grain running under the headline).
// Galaxy is a calmer, quieter effect: a twinkling starfield with gentle
// glow and subtle mouse repulsion, drifting slowly behind the hero copy.
// Same dependency as before — the ogl WebGL micro-library — so no new
// library needed. Ported faithfully from react-bits (Backgrounds/Galaxy),
// including the star-layer hash/twinkle math and the mouse-repulsion
// field, with the intersection/visibility pause behavior from the other
// effects on this site layered on top for consistency.
// Colors: saturation is 0 (per the requested props), so the stars render
// as neutral white/grey regardless of hueShift — that's intentional, it's
// what keeps this reading as "quiet" rather than introducing a new hue
// fighting the site's blue palette. The canvas stays transparent so the
// existing dark background and ambient blue glow show through underneath.
//
// NOTE: like beams.js, ferrofluid.js and topography.js before it, this
// file is kept for reference/version history but inlined directly into
// index.html rather than loaded via <script type="module" src="...">,
// since Chromium blocks module scripts loaded from local file:// paths.

import { Renderer, Program, Mesh, Triangle } from "https://unpkg.com/ogl@1.0.11/src/index.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - vec2(float(x), float(y)) - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

function initGalaxy(container, options = {}) {
  const {
    focal = [0.5, 0.5],
    rotation = [1.0, 0.0],
    starSpeed = 0.5,
    density = 1,
    hueShift = 140,
    speed = 1.0,
    mouseInteraction = true,
    glowIntensity = 0.3,
    saturation = 0.0,
    mouseRepulsion = true,
    repulsionStrength = 2,
    twinkleIntensity = 0.3,
    rotationSpeed = 0.1,
    autoCenterRepulsion = 0,
    transparent = true,
  } = options;

  const renderer = new Renderer({
    alpha: transparent,
    premultipliedAlpha: false,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  });

  const gl = renderer.gl;
  if (transparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  const canvas = gl.canvas;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Float32Array([1, 1, 1]) },
      uFocal: { value: new Float32Array(focal) },
      uRotation: { value: new Float32Array(rotation) },
      uStarSpeed: { value: starSpeed },
      uDensity: { value: density },
      uHueShift: { value: hueShift },
      uSpeed: { value: speed },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uGlowIntensity: { value: glowIntensity },
      uSaturation: { value: saturation },
      uMouseRepulsion: { value: mouseRepulsion },
      uTwinkleIntensity: { value: twinkleIntensity },
      uRotationSpeed: { value: rotationSpeed },
      uRepulsionStrength: { value: repulsionStrength },
      uMouseActiveFactor: { value: 0.0 },
      uAutoCenterRepulsion: { value: autoCenterRepulsion },
      uTransparent: { value: transparent },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  const setSize = () => {
    const w = Math.max(1, Math.floor(container.offsetWidth));
    const h = Math.max(1, Math.floor(container.offsetHeight));
    renderer.setSize(w, h);
    const res = program.uniforms.uResolution.value;
    res[0] = gl.canvas.width;
    res[1] = gl.canvas.height;
    res[2] = gl.canvas.width / gl.canvas.height;
    renderer.render({ scene: mesh });
  };

  const ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  const targetMouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };
  let targetActive = 0;
  let smoothActive = 0;

  const onMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    targetActive = 1.0;
  };
  const onMouseLeave = () => {
    targetActive = 0.0;
  };
  if (mouseInteraction) {
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
  }

  const t0 = performance.now();

  const renderFrame = (t) => {
    const time = (t - t0) * 0.001;
    const u = program.uniforms;
    u.uTime.value = time;
    u.uStarSpeed.value = (time * starSpeed) / 10.0;

    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.05;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.05;
    smoothActive += (targetActive - smoothActive) * 0.05;

    const m = u.uMouse.value;
    m[0] = smoothMouse.x;
    m[1] = smoothMouse.y;
    u.uMouseActiveFactor.value = smoothActive;

    renderer.render({ scene: mesh });
  };

  if (reduceMotion) {
    // Respect reduced-motion: render one static frame, no animation loop,
    // no continuous mouse-driven updates either.
    renderFrame(performance.now());
    return;
  }

  let raf = 0;
  let isVisible = true;
  let isPageVisible = !document.hidden;

  const loop = (t) => {
    renderFrame(t);
    raf = requestAnimationFrame(loop);
  };
  const tryStart = () => {
    if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
  };
  const tryStop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      isVisible ? tryStart() : tryStop();
    },
    { threshold: 0 }
  );
  io.observe(container);

  document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;
    isPageVisible ? tryStart() : tryStop();
  });

  tryStart();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("galaxy-bg");
  if (!container) return;
  try {
    initGalaxy(container, {
      mouseRepulsion: true,
      mouseInteraction: true,
      density: 1,
      glowIntensity: 0.3,
      saturation: 0,
      hueShift: 140,
      twinkleIntensity: 0.3,
      rotationSpeed: 0.1,
      repulsionStrength: 2,
      autoCenterRepulsion: 0,
      starSpeed: 0.5,
      speed: 1,
      transparent: true,
    });
  } catch (err) {
    console.warn("Galaxy background could not initialize:", err);
  }
});
