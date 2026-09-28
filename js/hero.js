// Veld Analytics — homepage hero
// The "VELD ANALYTICS" wordmark is already fully formed from particles the
// moment the page loads — visible before any scrolling happens, per client
// direction. A Galaxy WebGL starfield (js/galaxy-bg.js) drifts continuously
// behind this canvas as the "live moving background". As the visitor
// scrolls down through the pinned hero, the formed wordmark dissolves back
// apart, handing off to the Galaxy field behind it, and the pin releases
// into the rest of the page. The tagline/CTA below the wordmark are static
// DOM content, visible from load independent of this script.
//
// Scroll progress comes from GSAP ScrollTrigger's onUpdate (GSAP's own
// internal, batched scroll observer) — never a hand-rolled
// `window.addEventListener("scroll", ...)` — per the design-taste-frontend
// skill's hard ban on that pattern. The pin itself is plain CSS
// `position: sticky` (see .hero-form-pin in css/style.css); ScrollTrigger is
// only used here to read a 0-1 progress value over the same span.
//
// Respects prefers-reduced-motion (canvas is hidden entirely via CSS in
// that case, this script no-ops) and pauses the render loop when the hero
// scrolls out of view or the tab is hidden.

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Brand accent, mirrors --gold-bright from css/style.css. Hardcoded
  // because particle fills are computed per-frame as plain rgba, not
  // swapped as discrete CSS values.
  const ACCENT_BRIGHT = [223, 247, 255]; // --gold-bright

  document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".hero-form");
    const canvas = document.getElementById("hero-canvas");
    if (!section || !canvas || reduceMotion || !isDesktop()) return;

    const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
    if (!hasGsap) {
      // GSAP failed to load (CDN blocked, offline, etc). The static
      // tagline/CTA are already visible by default in CSS, so the hero
      // still works, just without the particle wordmark. Nothing to fix
      // here, just don't attempt the canvas.
      console.warn("Veld hero: GSAP not available, skipping particle wordmark.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let textParticles = [];
    let progress = 0;
    let running = false;

    function setSize() {
      w = Math.max(1, section.clientWidth || window.innerWidth);
      h = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Sample the wordmark into a point cloud using an offscreen canvas:
    // draw the text, read back pixel alpha, keep the points that landed on
    // a glyph. This is what lets the particle field "spell" real text
    // instead of an abstract shape.
    function sampleTextPoints() {
      const off = document.createElement("canvas");
      const offW = Math.min(Math.max(w * 0.86, 600), 1300);
      const offH = 260;
      off.width = offW;
      off.height = offH;
      const octx = off.getContext("2d");
      octx.clearRect(0, 0, offW, offH);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";

      const label = "VELD ANALYTICS";
      let fontSize = 110;
      octx.font = `700 ${fontSize}px "Space Grotesk", sans-serif`;
      let metrics = octx.measureText(label);
      const targetWidth = offW * 0.92;
      if (metrics.width > 0) {
        fontSize = fontSize * (targetWidth / metrics.width);
      }
      fontSize = Math.max(28, Math.min(fontSize, 150));
      octx.font = `700 ${fontSize}px "Space Grotesk", sans-serif`;
      octx.fillText(label, offW / 2, offH / 2);

      const img = octx.getImageData(0, 0, offW, offH).data;
      const step = Math.max(3, Math.round(offW / 260));
      const raw = [];
      for (let y = 0; y < offH; y += step) {
        for (let x = 0; x < offW; x += step) {
          const alpha = img[(y * offW + x) * 4 + 3];
          if (alpha > 140) raw.push({ x, y });
        }
      }

      // Cap particle count for performance; keep even coverage rather than
      // just truncating the array.
      const cap = 620;
      const points = [];
      const strideN = raw.length > cap ? Math.ceil(raw.length / cap) : 1;
      for (let i = 0; i < raw.length; i += strideN) points.push(raw[i]);

      // Map offscreen-canvas coordinates into the main hero canvas,
      // centred horizontally, vertical centre around 42% of the viewport.
      const originX = w / 2 - offW / 2;
      const originY = h * 0.42 - offH / 2;
      return points.map((p) => ({ tx: p.x + originX, ty: p.y + originY }));
    }

    function buildParticles() {
      const targets = sampleTextPoints();
      textParticles = targets.map((t) => ({
        tx: t.tx,
        ty: t.ty,
        // Dissolve destination: pushed further outward from each letter's
        // formed position (not just a random point) so the breakup reads as
        // an outward scatter into the Galaxy field behind it, rather than a
        // random reshuffle.
        sx: t.tx + (Math.random() - 0.5) * w * 0.9,
        sy: t.ty + (Math.random() - 0.5) * h * 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        size: 1.4 + Math.random() * 1.1,
      }));
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      // Inverted from a "scroll to reveal" pattern: the word is fully
      // formed at rest (progress 0, i.e. before any scrolling), visible the
      // instant the page loads. Scrolling through the pin then dissolves it
      // back apart, handing off to the Galaxy starfield running behind this
      // canvas — "you scroll and something happens" without ever hiding the
      // name up front.
      const dissolve = easeInOutCubic(clamp01(progress));
      // Calm, minimal jitter while the word reads clearly; ramps up as it
      // comes apart on scroll.
      const settle = lerp(4, 18, dissolve);

      for (const p of textParticles) {
        const jx = Math.sin(time * 0.001 * p.speed + p.phase) * settle;
        const jy = Math.cos(time * 0.0013 * p.speed + p.phase) * settle;
        const x = lerp(p.tx, p.sx, dissolve) + jx;
        const y = lerp(p.ty, p.sy, dissolve) + jy;
        const twinkle = 0.7 + 0.3 * Math.sin(time * 0.002 * p.speed + p.phase);
        // Fades out as it dissolves rather than staying bright once
        // scattered, so it reads as handing off to the Galaxy field behind
        // it, not just relocating.
        ctx.globalAlpha = Math.max(0, (0.85 + 0.15 * twinkle) * (1 - dissolve * 0.9));
        ctx.fillStyle = `rgb(${ACCENT_BRIGHT[0]},${ACCENT_BRIGHT[1]},${ACCENT_BRIGHT[2]})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function tick(time) {
      if (!running) return;
      draw(time);
    }

    function start() {
      if (running) return;
      running = true;
      gsap.ticker.add(tick);
    }
    function stop() {
      running = false;
      gsap.ticker.remove(tick);
    }

    setSize();
    // Sample against a generic sans-serif immediately so there's no blank
    // frame, then re-sample once Space Grotesk actually finishes loading
    // (document.fonts.ready) so the wordmark ends up in the real brand
    // font rather than the browser's fallback.
    buildParticles();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setSize();
        buildParticles();
      });
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(section);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (section.getBoundingClientRect().bottom > 0) start();
    });

    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!isDesktop()) {
            stop();
            return;
          }
          setSize();
          buildParticles();
          ScrollTrigger.refresh();
        }, 200);
      },
      { passive: true }
    );

    start();
  });
})();
