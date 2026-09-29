// Veld Analytics — interior page-hero background
// Vanilla JS port of react-bits' "Aurora" background effect. Replaces the
// earlier plain contour lines and then the data-network mesh: this is the
// bold swing — full-bleed, flowing aurora bands in the brand's blue range,
// tying into the "Veld" name (open landscape, open sky) that already
// anchors the copy on the About page. Same dependency as the homepage
// effects — the ogl WebGL micro-library — ported faithfully from
// react-bits (Backgrounds/Aurora), including the simplex-noise field and
// three-stop color ramp, pushed harder than the defaults (higher
// amplitude, faster flow) for more presence behind the hero copy.
//
// NOTE: like the homepage's Galaxy/Topography scripts, this is inlined
// directly rather than loaded via <script type="module" src="...">, since
// Chromium blocks module scripts loaded from local file:// paths.

import { Renderer, Program, Mesh, Color, Triangle } from "https://unpkg.com/ogl@1.0.11/src/index.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

function initAurora(container, options = {}) {
  const {
    colorStops = ["#2457FF", "#82A7FF", "#DFF7FF"],
    amplitude = 0.7,
    blend = 0.45,
    speed = 0.2,
  } = options;

  const renderer = new Renderer({
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  });

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.canvas.style.backgroundColor = "transparent";
  gl.canvas.style.width = "100%";
  gl.canvas.style.height = "100%";
  gl.canvas.style.display = "block";
  container.appendChild(gl.canvas);

  const geometry = new Triangle(gl);
  if (geometry.attributes.uv) delete geometry.attributes.uv;

  const colorStopsArray = colorStops.map((hex) => {
    const c = new Color(hex);
    return [c.r, c.g, c.b];
  });

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: amplitude },
      uColorStops: { value: colorStopsArray },
      uResolution: { value: [container.offsetWidth, container.offsetHeight] },
      uBlend: { value: blend },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  const setSize = () => {
    const w = Math.max(1, Math.floor(container.offsetWidth));
    const h = Math.max(1, Math.floor(container.offsetHeight));
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = [w, h];
    renderer.render({ scene: mesh });
  };

  const ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  const t0 = performance.now();
  const renderFrame = (t) => {
    const time = (t - t0) * 0.01;
    program.uniforms.uTime.value = time * speed * 0.1;
    renderer.render({ scene: mesh });
  };

  if (reduceMotion) {
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
  const container = document.getElementById("aurora-bg");
  if (!container) return;
  if (!("WebGL2RenderingContext" in window)) return;
  try {
    initAurora(container, {
      colorStops: ["#2457FF", "#82A7FF", "#DFF7FF"],
      amplitude: 0.7,
      blend: 0.45,
      speed: 0.2,
    });
  } catch (err) {
    console.warn("Aurora background could not initialize:", err);
  }
});
