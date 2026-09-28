// Veld Analytics — homepage hero background, v2
// A dependency-free Canvas2D spiral-galaxy field: two arms of stars winding
// out of a bright core, warm amber near the centre fading to cool ice-blue
// at the edges. Replaces the earlier ogl/WebGL "Galaxy" shader (js/galaxy.js)
// specifically on the homepage — no external library, smaller and easier to
// reason about, and lets the core glow sit as the visual anchor between the
// two split-edge wordmarks ("Veld" / "Analytics") the way a centred hero
// graphic sits between two edge-pinned words on a reference layout we were
// asked to riff on. This is a galaxy composition, not a literal glyph —
// shaping particles into a precise letterform is a different (harder)
// problem and out of scope for a first pass.
//
// Respects prefers-reduced-motion (one static frame, no loop) and pauses
// via IntersectionObserver + visibilitychange, matching the pattern used by
// every other background effect on this site (see js/galaxy.js, js/aurora.js).

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mixColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t)),
    ];
  }

  const CORE = [255, 244, 230]; // warm white core
  const WARM = [242, 166, 90]; // amber, inner arms
  const COOL = [140, 200, 255]; // ice blue, outer arms

  function buildParticles(count) {
    const particles = [];
    const arms = 2;
    for (let a = 0; a < arms; a++) {
      const armOffset = (a / arms) * Math.PI * 2;
      const perArm = Math.floor(count / arms);
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm; // 0 (core) -> 1 (outer edge)
        const angle = armOffset + t * Math.PI * 2.6 + (Math.random() - 0.5) * 0.35;
        const radius = Math.pow(t, 0.62) * 1.0;
        const jitter = (Math.random() - 0.5) * 0.05 * (0.3 + t);
        const color = t < 0.18
          ? mixColor(CORE, WARM, t / 0.18)
          : mixColor(WARM, COOL, (t - 0.18) / 0.82);
        particles.push({
          angle,
          radius: radius + jitter,
          t,
          size: lerp(2.6, 0.7, t) * (0.7 + Math.random() * 0.6),
          color,
          twinkleSpeed: 0.6 + Math.random() * 1.4,
          twinklePhase: Math.random() * Math.PI * 2,
          glow: t < 0.1,
        });
      }
    }
    // A handful of ambient background stars scattered across the whole hero,
    // independent of the spiral, so the field doesn't feel like a hard-edged disc.
    for (let i = 0; i < Math.floor(count * 0.25); i++) {
      particles.push({
        ambient: true,
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + Math.random() * 1,
        color: mixColor(COOL, CORE, Math.random() * 0.4),
        twinkleSpeed: 0.4 + Math.random() * 1,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }

  function initGalaxyV(container) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const particles = buildParticles(260);

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      w = Math.max(1, container.offsetWidth);
      h = Math.max(1, container.offsetHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const targetMouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = (e.clientY - rect.top) / rect.height;
    };
    container.addEventListener("mousemove", onMouseMove);

    let rotation = 0;
    const t0 = performance.now();

    function draw(now) {
      const time = (now - t0) * 0.001;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.62;

      smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.04;
      smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.04;
      const parX = (smoothMouse.x - 0.5) * 18;
      const parY = (smoothMouse.y - 0.5) * 18;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        let px, py;

        if (p.ambient) {
          px = p.x * w + parX * 0.3;
          py = p.y * h + parY * 0.3;
          ctx.globalAlpha = twinkle * 0.5;
        } else {
          const ang = p.angle + rotation;
          px = cx + Math.cos(ang) * p.radius * scale + parX;
          py = cy + Math.sin(ang) * p.radius * scale * 0.7 + parY;
          ctx.globalAlpha = twinkle * lerp(1, 0.35, p.t);
        }

        const [r, g, b] = p.color;
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        if (p.glow) {
          ctx.shadowBlur = 16;
          ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    if (reduceMotion) {
      draw(performance.now());
      return;
    }

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;

    const loop = (now) => {
      rotation += 0.0006;
      draw(now);
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
    const container = document.getElementById("galaxy-v-bg");
    if (!container) return;
    try {
      initGalaxyV(container);
    } catch (err) {
      console.warn("Galaxy-V background could not initialize:", err);
    }
  });
})();
