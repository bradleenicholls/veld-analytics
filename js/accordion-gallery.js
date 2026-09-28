// Veld Analytics — Accordion Gallery (Work page case studies)
//
// Vanilla-JS/GSAP port of the React Bits <AccordionGallery /> component.
// Ported off React because this site has no build step: the panels are
// written directly in HTML (real <img> tags with real alt text, good for
// SEO and for a no-JS fallback) and this script only adds the hover/
// click/keyboard-driven expand behaviour on top of markup that already
// works — every panel shows recognisable dashboard content even before
// GSAP loads or runs.
//
// One accordion instance per ".accordion-gallery" container, configured
// via data-* attributes so multiple galleries with different tuning could
// coexist on one page. Currently used once, on /work/.

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  document.querySelectorAll(".accordion-gallery").forEach((root) => {
    const panels = Array.from(root.querySelectorAll(".ag-panel"));
    if (!panels.length) return;

    const count = panels.length;
    const vertical = root.classList.contains("accordion-gallery--vertical");

    const cfg = {
      defaultIndex: clampIndex(parseInt(root.dataset.defaultIndex, 10), count, 2),
      expandRatio: clampNum(parseFloat(root.dataset.expandRatio), 0.2, 0.9, 0.52),
      duration: numOr(parseFloat(root.dataset.duration), 0.6),
      ease: root.dataset.ease || "power3.out",
      parallax: numOr(parseFloat(root.dataset.parallax), 0.5),
      tilt: numOr(parseFloat(root.dataset.tilt), 8),
      stagger: numOr(parseFloat(root.dataset.stagger), 0.06),
      trigger: root.dataset.trigger === "click" ? "click" : "hover",
      gap: numOr(parseFloat(root.dataset.gap), 10),
      height: numOr(parseFloat(root.dataset.height), 460),
    };

    // The source component sets this via an inline height prop (needed —
    // panels are flex children with no intrinsic height of their own,
    // since their media is absolutely positioned). Vertical orientation
    // isn't used on this site, but keeps the same 1.6x convention as the
    // source component if it ever is.
    root.style.height = vertical ? `${Math.round(cfg.height * 1.6)}px` : `${cfg.height}px`;

    let active = cfg.defaultIndex;
    let mediaSize = 320;
    let currentTl = null;

    function applyLayout(animate) {
      const grow = count > 1 ? (cfg.expandRatio * (count - 1)) / (1 - cfg.expandRatio) : 1;
      const dur = animate && !reduceMotion && hasGsap ? cfg.duration : 0;

      if (hasGsap && currentTl) currentTl.kill();
      const tl = hasGsap ? gsap.timeline() : null;

      panels.forEach((panel, i) => {
        const isActive = i === active;
        const media = panel.querySelector(".ag-panel__media");
        const bar = panel.querySelector(".ag-panel__bar");
        const text = panel.querySelector(".ag-panel__text");

        const rot = isActive ? 0 : i < active ? cfg.tilt : -cfg.tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        panel.classList.toggle("ag-panel--active", isActive);
        panel.setAttribute("aria-current", isActive ? "true" : "false");

        if (tl) {
          tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease: cfg.ease }, 0);
        } else {
          panel.style.flexGrow = isActive ? grow : 1;
        }

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * cfg.parallax * mediaSize * 0.06;
          const gray = isActive ? 0 : 1;
          const dim = isActive ? 0 : 0.35;
          if (tl) {
            tl.to(
              media,
              {
                xPercent: -50,
                yPercent: -50,
                x: vertical ? 0 : isActive ? 0 : shift,
                y: vertical ? (isActive ? 0 : shift) : 0,
                "--ag-gray": gray,
                "--ag-dim": dim,
                duration: dur,
                ease: cfg.ease,
              },
              0
            );
          } else {
            media.style.setProperty("--ag-gray", gray);
            media.style.setProperty("--ag-dim", dim);
          }
        }

        if (bar && text) {
          if (tl) {
            if (isActive) {
              tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease: cfg.ease, stagger: reduceMotion ? 0 : cfg.stagger }, 0);
            } else {
              tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease: cfg.ease }, 0);
            }
          } else {
            bar.style.opacity = text.style.opacity = isActive ? 1 : 0;
          }
        }
      });

      currentTl = tl;
    }

    function setActive(i, animate) {
      if (i === active) return;
      active = i;
      applyLayout(animate !== false);
    }

    function measure() {
      const rect = root.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - cfg.gap * (count - 1), 120);
      mediaSize = Math.max(140, usable * cfg.expandRatio * 1.22);
      root.style.setProperty("--ag-media-size", `${mediaSize}px`);
    }

    panels.forEach((panel, i) => {
      panel.style.transformStyle = "preserve-3d";
      if (cfg.trigger === "hover") {
        panel.addEventListener("mouseenter", () => setActive(i));
      }
      panel.addEventListener("click", (e) => {
        if (i !== active) {
          e.preventDefault();
          setActive(i);
        }
        // If already active and the panel is a real link, let the click
        // through — same behaviour as the source component.
      });
      panel.addEventListener("focus", () => setActive(i));
      panel.addEventListener("keydown", (e) => {
        const forward = vertical ? "ArrowDown" : "ArrowRight";
        const back = vertical ? "ArrowUp" : "ArrowLeft";
        if (e.key === forward) {
          e.preventDefault();
          setActive((i + 1) % count);
          panels[(i + 1) % count].focus();
        } else if (e.key === back) {
          e.preventDefault();
          setActive((i - 1 + count) % count);
          panels[(i - 1 + count) % count].focus();
        }
      });
    });

    measure();
    applyLayout(false);

    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          measure();
          applyLayout(false);
        }, 150);
      },
      { passive: true }
    );
  });

  function clampIndex(v, count, fallback) {
    if (!Number.isFinite(v)) v = fallback;
    return Math.min(Math.max(v, 0), Math.max(count - 1, 0));
  }
  function clampNum(v, min, max, fallback) {
    if (!Number.isFinite(v)) v = fallback;
    return Math.min(Math.max(v, min), max);
  }
  function numOr(v, fallback) {
    return Number.isFinite(v) ? v : fallback;
  }
});
