// Veld Analytics — Galaxy background
//
// Vanilla-JS/WebGL port of the React Bits <Galaxy /> component (same
// vertex/fragment shaders, same uniforms, same mouse-repulsion behaviour).
// Ported off React because this site has no build step — there's no JSX,
// no hooks, just a DOM scan + a small mount/teardown lifecycle per element.
//
// Used as the living starfield behind every hero on the site: the homepage
// hero-form-pin (sits behind the particle wordmark canvas, js/hero.js) and
// every interior page's .page-hero (replacing what used to be a static,
// frozen SVG star scatter). Any element with class "galaxy-mount" gets its
// own independent instance; `data-galaxy-preset` picks the tuning ("hero"
// or "page").
//
// ogl is imported straight from a CDN (no bundler in this project) —
// pinned to a specific version so this doesn't silently change out from
// under the site later.
import { Renderer, Program, Mesh, Color, Triangle } from "https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
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

// Tuning per context. Brand accent is a cool blue (--gold / --gold-bright
// in css/style.css are actually blue despite the variable names — see that
// file's :root comment), so both presets sit around the same blue hue with
// low-moderate saturation rather than the component's default green-ish
// grayscale. "hero" runs a little brighter/faster since it's the sole
// visual on the homepage; "page" stays calmer, sitting behind a headline.
const PRESETS = {
  hero: {
    density: 1.1,
    hueShift: 220,
    saturation: 0.35,
    glowIntensity: 0.35,
    twinkleIntensity: 0.45,
    starSpeed: 0.35,
    speed: 0.5,
    rotationSpeed: 0.03,
    repulsionStrength: 1.6,
  },
  page: {
    density: 0.85,
    hueShift: 215,
    saturation: 0.3,
    glowIntensity: 0.26,
    twinkleIntensity: 0.35,
    starSpeed: 0.3,
    speed: 0.4,
    rotationSpeed: 0.025,
    repulsionStrength: 1.4,
  },
};

function mountGalaxy(container, presetName) {
  const preset = PRESETS[presetName] || PRESETS.page;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // No hover means no pointer to repel from — skip the listeners entirely
  // rather than pay for dead event handlers on touch devices.
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const opts = Object.assign(
    {
      focal: [0.5, 0.5],
      rotation: [1.0, 0.0],
      mouseRepulsion: canHover,
      autoCenterRepulsion: 0,
      transparent: true,
      disableAnimation: reduceMotion,
    },
    preset
  );

  let renderer, gl, program, mesh, canvas;
  try {
    renderer = new Renderer({ alpha: opts.transparent, premultipliedAlpha: false });
    gl = renderer.gl;
  } catch (err) {
    // WebGL unavailable (old browser, disabled, exhausted contexts). The
    // hero/page-hero still work fine with no background layer at all.
    console.warn("Veld galaxy background: WebGL unavailable, skipping.", err);
    return;
  }

  if (opts.transparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  function resize() {
    const w = Math.max(1, container.offsetWidth);
    const h = Math.max(1, container.offsetHeight);
    renderer.setSize(w, h);
    if (program) {
      program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
  }

  const geometry = new Triangle(gl);
  program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
      uFocal: { value: new Float32Array(opts.focal) },
      uRotation: { value: new Float32Array(opts.rotation) },
      uStarSpeed: { value: opts.starSpeed },
      uDensity: { value: opts.density },
      uHueShift: { value: opts.hueShift },
      uSpeed: { value: opts.speed },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uGlowIntensity: { value: opts.glowIntensity },
      uSaturation: { value: opts.saturation },
      uMouseRepulsion: { value: opts.mouseRepulsion },
      uTwinkleIntensity: { value: opts.twinkleIntensity },
      uRotationSpeed: { value: opts.rotationSpeed },
      uRepulsionStrength: { value: opts.repulsionStrength },
      uMouseActiveFactor: { value: 0 },
      uAutoCenterRepulsion: { value: opts.autoCenterRepulsion },
      uTransparent: { value: opts.transparent },
    },
  });

  mesh = new Mesh(gl, { geometry, program });

  const targetMouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };
  let targetActive = 0;
  let smoothActive = 0;
  let raf = 0;
  let running = false;

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (!opts.disableAnimation) {
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uStarSpeed.value = (t * 0.001 * opts.starSpeed) / 10.0;
    }
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.05;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.05;
    smoothActive += (targetActive - smoothActive) * 0.05;
    program.uniforms.uMouse.value[0] = smoothMouse.x;
    program.uniforms.uMouse.value[1] = smoothMouse.y;
    program.uniforms.uMouseActiveFactor.value = smoothActive;
    renderer.render({ scene: mesh });
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function handleMove(e) {
    const rect = container.getBoundingClientRect();
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    targetActive = 1;
  }
  function handleLeave() {
    targetActive = 0;
  }

  canvas = gl.canvas;
  container.appendChild(canvas);
  window.addEventListener("resize", resize, { passive: true });
  resize();

  if (opts.mouseRepulsion) {
    container.addEventListener("mousemove", handleMove, { passive: true });
    container.addEventListener("mouseleave", handleLeave, { passive: true });
  }

  // Only run the render loop while the mount is actually on screen and the
  // tab is visible — a WebGL canvas behind every hero on the site should
  // never cost anything on a page (or tab) you're not looking at.
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(container);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (container.getBoundingClientRect().bottom > 0) start();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".galaxy-mount").forEach((el) => {
    mountGalaxy(el, el.dataset.galaxyPreset);
  });
});
