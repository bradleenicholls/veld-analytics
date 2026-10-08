// Veld Analytics: AcidSquares corridor background for the phone / tablet hero.
// Plain WebGL2 port of the React Bits "AcidSquares" shader (no ogl / React),
// recoloured to Veld blue. Runs only at <= 1100px (desktop keeps the cube),
// pauses off-screen / in background tabs, and renders one still frame under
// prefers-reduced-motion.
(function () {
  const host = document.querySelector(".hero-acid");
  if (!host) return;

  const VERT = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed, uWaveDepth, uZoom, uDensity, uSpread, uStepSize, uGlow, uExposure, uColorShift, uContrast, uBrightness, uOpacity, uSteps;
uniform vec3 uColor1, uColor2, uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength, uMouseRadius, uEnableMouse, uMouseActive, uGrain, uGrainIntensity;
out vec4 fragColor;
void main(){
  vec2 frag = gl_FragCoord.xy;
  float zoom = max(uZoom, 0.05);
  float aspect = iResolution.x / iResolution.y;
  vec2 ndc = (2.0 * frag - iResolution.xy) / iResolution.y;
  vec2 dir = ndc * (0.5 / zoom);
  vec2 mouseNdc = vec2(uMouse.x * aspect, uMouse.y);
  float mr = max(uMouseRadius, 0.01);
  vec2 md = ndc - mouseNdc;
  float dent = exp(-dot(md, md) / (mr * mr)) * (3.0 * uMouseStrength * uEnableMouse * uMouseActive);
  float travel = sin(iTime * uSpeed) * uWaveDepth;
  float density = max(uDensity, 1.0);
  float spread = clamp(uSpread, 0.05, 0.6);
  float stepSize = max(uStepSize, 0.0005);
  float glowGain = max(uGlow, 0.0);
  vec3 tOffset = vec3(0.0, dent, travel);
  vec3 p = vec3(0.0);
  float s = 0.0;
  float glow = 0.0;
  for (int i = 0; i < 64; i++) {
    if (float(i) >= uSteps) break;
    p += vec3(dir * s, s);
    vec3 q = p + tOffset;
    s += density - length(q.xz) + length(ceil(q).xy);
    s = stepSize + abs(s) * spread;
    glow += glowGain / s;
  }
  float e = glow / max(uExposure, 1.0);
  float shimmer = 0.5 + 0.5 * dot(cos(iTime * uColorShift + p), vec3(0.3333));
  float v = tanh(e * uBrightness * mix(0.7, 1.05, shimmer));
  v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);
  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, v));
  col = mix(col, uColor3, smoothstep(0.55, 1.0, v));
  col *= v;
  float a = clamp(v, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * a;
  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    a = clamp(a + gv, 0.0, 1.0);
  }
  fragColor = vec4(outRgb, a);
}`;

  const OPTS = {
    color1: "#2457FF", color2: "#82A7FF", color3: "#DFF7FF",
    steps: 24, speed: 0.5, waveDepth: 1, zoom: 1.3, density: 10, glow: 1,
    exposure: 2700, spread: 0.3, stepSize: 0.002, colorShift: 0, contrast: 1,
    brightness: 1, opacity: 1, grain: true, grainIntensity: 0.04, dpr: 1.25,
  };
  const mq = window.matchMedia("(max-width: 1100px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = (h) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
  };

  let inst = null;

  function create() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block";
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, s) => {
      const x = gl.createShader(type);
      gl.shaderSource(x, s);
      gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x));
      return x;
    };
    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      return null;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const f = (n, v) => gl.uniform1f(U(n), v);
    const c1 = hex(OPTS.color1), c2 = hex(OPTS.color2), c3 = hex(OPTS.color3);
    gl.uniform3f(U("uColor1"), c1[0], c1[1], c1[2]);
    gl.uniform3f(U("uColor2"), c2[0], c2[1], c2[2]);
    gl.uniform3f(U("uColor3"), c3[0], c3[1], c3[2]);
    f("uSpeed", OPTS.speed); f("uWaveDepth", OPTS.waveDepth); f("uZoom", OPTS.zoom); f("uDensity", OPTS.density);
    f("uSpread", OPTS.spread); f("uStepSize", OPTS.stepSize); f("uGlow", OPTS.glow); f("uExposure", OPTS.exposure);
    f("uColorShift", OPTS.colorShift); f("uContrast", OPTS.contrast); f("uBrightness", OPTS.brightness);
    f("uOpacity", OPTS.opacity); f("uSteps", OPTS.steps); f("uMouseStrength", 0); f("uMouseRadius", 0.35);
    f("uEnableMouse", 0); f("uMouseActive", 0); f("uGrain", OPTS.grain ? 1 : 0); f("uGrainIntensity", OPTS.grainIntensity);
    gl.uniform2f(U("uMouse"), 0, 0);
    gl.clearColor(0, 0, 0, 0);

    let raf = 0, visible = true, pageVisible = !document.hidden, dead = false;
    const t0 = performance.now();
    function size() {
      const r = host.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, OPTS.dpr);
      canvas.width = Math.max(1, Math.floor(r.width * d));
      canvas.height = Math.max(1, Math.floor(r.height * d));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("iResolution"), canvas.width, canvas.height);
    }
    function frame(t) {
      raf = 0;
      if (dead) return;
      f("iTime", reduce ? 2.0 : (t - t0) * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      host.classList.add("is-ready");
      if (!reduce && visible && pageVisible) raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!raf && !dead) raf = requestAnimationFrame(frame); };
    const ro = new ResizeObserver(() => { size(); start(); });
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) start(); })
      : null;
    const onVis = () => { pageVisible = !document.hidden; if (pageVisible) start(); };

    host.appendChild(canvas);
    size();
    ro.observe(host);
    if (io) io.observe(host);
    document.addEventListener("visibilitychange", onVis);
    start();

    return function destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.classList.remove("is-ready");
      try { host.removeChild(canvas); } catch (e) {}
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }

  function sync() {
    if (mq.matches && !inst) inst = create();
    else if (!mq.matches && inst) { inst(); inst = null; }
  }
  if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
  sync();
})();
