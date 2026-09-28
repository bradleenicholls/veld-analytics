// Veld Analytics — homepage scroll hero
// Drives the pinned hero's narrative purely off scroll progress: a field of
// scattered points fades in, migrates into an ascending line chart, the
// chart draws itself on, and the stat readout counts up — dramatizing
// "scattered platform data becoming a dashboard your team uses".
//
// Pinning is CSS-only (`position: sticky`); this file only ever reads
// scroll position and writes transform/opacity/SVG coordinates, batched via
// requestAnimationFrame and gated by IntersectionObserver so nothing runs
// while the hero is off-screen. Falls back to a fully visible, statically
// resolved layout for prefers-reduced-motion or viewports under 901px
// (see the .sh-nopin / max-width:900px rules in css/style.css) — same
// resolved chart is computed once, not animated.

(function () {
  const POINT_COUNT = 26;
  const VB_W = 1000;
  const VB_H = 720;
  const MARGIN = 50;

  // Colors mirror --gold / --gold-bright from css/style.css. Hardcoded here
  // because these get interpolated per-frame as plain RGB, not swapped as
  // discrete CSS values.
  const GOLD = [130, 167, 255];
  const GOLD_BRIGHT = [223, 247, 255];
  const BORDER = "rgba(243, 241, 233, 0.14)";

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function mapRange(v, a, b) { return clamp01((v - a) / (b - a)); }
  // smoothstep-style ease for anything derived from mapRange
  function ease(t) { return t * t * (3 - 2 * t); }
  function mixColor(c1, c2, t) {
    return `rgb(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(lerp(c1[1], c2[1], t))}, ${Math.round(lerp(c1[2], c2[2], t))})`;
  }

  function buildPoints() {
    const pts = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const t = i / (POINT_COUNT - 1);
      const ox = MARGIN + t * (VB_W - MARGIN * 2);
      const noise = (Math.sin(i * 12.9) * 0.5 + Math.sin(i * 3.7) * 0.5) * 34;
      const oy = clampNum(VB_H - MARGIN - t * (VB_H - MARGIN * 2) + noise, MARGIN, VB_H - MARGIN);
      pts.push({
        sx: MARGIN + Math.random() * (VB_W - MARGIN * 2),
        sy: MARGIN + Math.random() * (VB_H - MARGIN * 2),
        ox,
        oy,
        appearAt: 0.05 + Math.random() * 0.2, // staggered appear start, within the appear window
      });
    }
    return pts;
  }
  function clampNum(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function formatNum(target, format, t) {
    const v = target * t;
    if (format === "pct") return v.toFixed(1) + "%";
    if (format === "gbp") return "£" + Math.round(v).toLocaleString("en-GB");
    return Math.round(v).toLocaleString("en-GB");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".scrollhero");
    if (!section) return;

    const pin = section.querySelector(".scrollhero-pin");
    const svg = section.querySelector(".sh-svg");
    const pointsGroup = section.querySelector(".sh-points");
    const axisGroup = section.querySelector(".sh-axis");
    const chartLine = section.querySelector(".sh-chart-line");
    const actions = section.querySelector(".sh-actions");
    const stats = section.querySelector(".sh-stats");
    const hint = section.querySelector(".scrollhero-hint");
    const progressFill = section.querySelector(".scrollhero-progress-fill");
    const numEls = Array.from(section.querySelectorAll(".sh-num"));

    if (!svg || !pointsGroup || !chartLine) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

    const points = buildPoints();

    // Static axis reference lines, drawn once.
    axisGroup.innerHTML = `
      <line x1="${MARGIN}" y1="${VB_H - MARGIN}" x2="${VB_W - MARGIN}" y2="${VB_H - MARGIN}" stroke="${BORDER}" />
      <line x1="${MARGIN}" y1="${MARGIN}" x2="${MARGIN}" y2="${VB_H - MARGIN}" stroke="${BORDER}" />
    `;

    // Build the point <circle> elements once; only cx/cy/r/opacity/fill
    // change per frame after this.
    const ns = "http://www.w3.org/2000/svg";
    points.forEach((p) => {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("r", "2.4");
      pointsGroup.appendChild(c);
      p.el = c;
    });

    function render(progress) {
      const appear = ease(mapRange(progress, 0.05, 0.34));
      const organize = ease(mapRange(progress, 0.42, 0.8));
      const lineOpacity = ease(mapRange(progress, 0.5, 0.72));
      const draw = ease(mapRange(progress, 0.58, 0.9));
      const statT = ease(mapRange(progress, 0.72, 1));
      const actionsT = ease(mapRange(progress, 0.8, 1));

      let d = "";
      points.forEach((p, i) => {
        const cx = lerp(p.sx, p.ox, organize);
        const cy = lerp(p.sy, p.oy, organize);
        const localAppear = clamp01((appear - p.appearAt * 0.4) / (1 - p.appearAt * 0.4));
        p.el.setAttribute("cx", cx.toFixed(1));
        p.el.setAttribute("cy", cy.toFixed(1));
        p.el.setAttribute("r", (1.8 + 1.6 * localAppear).toFixed(2));
        p.el.setAttribute("opacity", localAppear.toFixed(2));
        p.el.setAttribute("fill", mixColor(GOLD, GOLD_BRIGHT, organize));
        d += (i === 0 ? "M " : "L ") + cx.toFixed(1) + "," + cy.toFixed(1) + " ";
      });

      chartLine.setAttribute("d", d);
      chartLine.style.opacity = lineOpacity.toFixed(2);
      if (lineOpacity > 0.01) {
        const len = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = len;
        chartLine.style.strokeDashoffset = (len * (1 - draw)).toFixed(1);
      }

      if (stats) stats.style.opacity = (0.15 + 0.85 * statT).toFixed(2);
      if (actions) {
        actions.style.opacity = actionsT.toFixed(2);
        actions.style.transform = `translateY(${(1 - actionsT) * 14}px)`;
      }
      numEls.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const format = el.dataset.format;
        el.textContent = formatNum(target, format, statT);
      });
      if (progressFill) progressFill.style.width = (progress * 100).toFixed(1) + "%";
      if (hint) hint.style.opacity = progress > 0.04 ? "0" : "1";
    }

    // Reduced motion / narrow viewports: compute the fully-resolved frame
    // once and leave it static, no scroll listener at all.
    if (reduceMotion) {
      section.classList.add("sh-nopin");
      render(1);
      return;
    }

    let ticking = false;
    let active = false;

    function tick() {
      ticking = false;
      if (!active) return;
      if (!isDesktop()) {
        // Viewport crossed into the mobile breakpoint after load (e.g. a
        // resize/orientation change) — hand off to the static CSS layout.
        section.classList.add("sh-nopin");
        render(1);
        return;
      }
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 1;
      render(progress);
      requestAnimationFrame(tick);
      ticking = true;
    }

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }

    if (!isDesktop()) {
      section.classList.add("sh-nopin");
      render(1);
      return;
    }

    render(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestTick();
      },
      { threshold: 0 }
    );
    io.observe(section);

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
  });
})();
