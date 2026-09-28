// Veld Analytics — homepage hero
// One live component, nothing else in the hero. A field of particles drifts
// continuously (the "live moving background"), always visible from load.
// As the visitor scrolls down through the pinned hero, those particles
// converge into the "VELD ANALYTICS" wordmark; once formed, the tagline and
// CTA (already present in the DOM as a static fallback) get their entrance
// treatment and the pin releases into the rest of the page.
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

  // Brand accent, mirrors --gold / --gold-bright / --text-faint from
  // css/style.css. Hardcoded because particle fills are computed per-frame
  // as plain rgba, not swapped as discrete CSS values.
  const ACCENT = [130, 167, 255]; // --gold
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
    let ambientParticles = [];
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
        sx: Math.random() * w,
        sy: Math.random() * h,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        size: 1.4 + Math.random() * 1.1,
      }));

      const ambientCount = Math.round((w * h) / 26000);
      ambientParticles = Array.from({ length: Math.min(ambientCount, 140) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6,
        size: 0.6 + Math.random() * 1,
      }));
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      // Formation completes within the first 70% of the (now much shorter)
      // pin range, then holds the formed word for the last 30% before the
      // pin releases — the wordmark resolves quickly near the top of the
      // page, not gradually across a long scroll.
      const eased = easeInOutCubic(clamp01(progress / 0.7));
      // Jitter never fully stops, even once formed — a small permanent
      // "breathing" motion so the field always reads as live, not frozen.
      const settle = lerp(16, 5, eased);

      for (const p of textParticles) {
        const jx = Math.sin(time * 0.001 * p.speed + p.phase) * settle;
        const jy = Math.cos(time * 0.0013 * p.speed + p.phase) * settle;
        const x = lerp(p.sx, p.tx, eased) + jx;
        const y = lerp(p.sy, p.ty, eased) + jy;
        const twinkle = 0.7 + 0.3 * Math.sin(time * 0.002 * p.speed + p.phase);
        // Text particles read as the bright foreground wordmark throughout,
        // not just once fully formed.
        ctx.globalAlpha = Math.min(1, 0.85 + 0.15 * twinkle);
        ctx.fillStyle = `rgb(${ACCENT_BRIGHT[0]},${ACCENT_BRIGHT[1]},${ACCENT_BRIGHT[2]})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of ambientParticles) {
        const dx = Math.sin(time * 0.0004 * p.speed + p.phase) * 30;
        const dy = Math.cos(time * 0.0003 * p.speed + p.phase) * 20;
        const twinkle = 0.55 + 0.35 * Math.sin(time * 0.0015 * p.speed + p.phase);
        ctx.globalAlpha = twinkle * 0.75;
        ctx.fillStyle = `rgb(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]})`;
        ctx.beginPath();
        ctx.arc(p.x + dx, p.y + dy, p.size, 0, Math.PI * 2);
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
