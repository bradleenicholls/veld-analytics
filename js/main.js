// Veld Analytics — shared site behavior

document.addEventListener("DOMContentLoaded", () => {
  // Nav scroll state
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 24) nav?.classList.add("scrolled");
    else nav?.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu toggle
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // Stagger children with .reveal-stagger / .tilt-stagger
  document.querySelectorAll(".reveal-stagger, .tilt-stagger").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 90}ms`;
    });
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 3D tilt-in reveal (cards rotating up into place)
  const tiltEls = document.querySelectorAll(".tilt-in");
  if ("IntersectionObserver" in window) {
    const tiltIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            tiltIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    tiltEls.forEach((el) => tiltIo.observe(el));
  } else {
    tiltEls.forEach((el) => el.classList.add("visible"));
  }

  // ---------- Scroll-driven 3D parallax (works for any .scene block) ----------
  if (!reduceMotion) {
    const scenes = Array.from(document.querySelectorAll(".scene")).map((scene) => ({
      scene,
      layers: scene.querySelector(".scene-layers"),
      depthLayers: scene.querySelectorAll(".scene-layer[data-depth]"),
    }));

    let ticking = false;

    const updateParallax = () => {
      ticking = false;
      const viewportH = window.innerHeight;

      scenes.forEach(({ scene, layers, depthLayers }) => {
        if (!layers) return;
        const rect = scene.getBoundingClientRect();
        // Normalized progress (0 to 1) as the scene travels through the viewport.
        const total = rect.height + viewportH;
        const passed = viewportH - rect.top;
        const t = Math.min(Math.max(passed / total, 0), 1);
        const centered = t - 0.5; // -0.5 .. 0.5, zero when scene is centered

        layers.style.transform = `rotateX(${centered * -12}deg)`;

        depthLayers.forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth || "0.5");
          const z = parseFloat(layer.dataset.z || "0");
          const scale = parseFloat(layer.dataset.scale || "1");
          const y = centered * depth * 260;
          layer.style.transform = `translateY(${y}px) translateZ(${z}px) scale(${scale})`;
        });
      });
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }

  // ---------- Persistent landscape background: scroll + cursor parallax ----------
  if (!reduceMotion) {
    const landscapeLayers = document.querySelectorAll(".landscape-layer[data-depth]");
    const landscapeGlow = document.querySelector(".landscape-glow");
    const hoverCapable = window.matchMedia("(hover: hover)").matches;

    let scrollOffset = 0;
    let mouseX = 0.5; // 0..1 across viewport
    let mouseY = 0.5;
    let landscapeTicking = false;

    const renderLandscape = () => {
      landscapeTicking = false;
      landscapeLayers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || "0.3");
        const scrollShift = scrollOffset * depth * 0.06;
        const cursorShiftX = hoverCapable ? (mouseX - 0.5) * depth * 26 : 0;
        const cursorShiftY = hoverCapable ? (mouseY - 0.5) * depth * 14 : 0;
        layer.style.transform = `translate3d(${cursorShiftX}px, ${scrollShift + cursorShiftY}px, 0)`;
      });
      if (landscapeGlow) {
        const glowShift = scrollOffset * 0.02;
        landscapeGlow.style.transform = `translate(-50%, calc(-50% + ${glowShift}px))`;
      }
    };

    const scheduleLandscapeRender = () => {
      if (!landscapeTicking) {
        window.requestAnimationFrame(renderLandscape);
        landscapeTicking = true;
      }
    };

    window.addEventListener(
      "scroll",
      () => {
        scrollOffset = window.scrollY;
        scheduleLandscapeRender();
      },
      { passive: true }
    );

    if (hoverCapable) {
      window.addEventListener(
        "mousemove",
        (e) => {
          mouseX = e.clientX / window.innerWidth;
          mouseY = e.clientY / window.innerHeight;
          scheduleLandscapeRender();
        },
        { passive: true }
      );
    }

    renderLandscape();
  }

  // ---------- Route progress rail ----------
  const routeFill = document.querySelector(".route-rail .route-fill");
  const routeDot = document.querySelector(".route-rail .route-dot");
  if (routeFill && !reduceMotion) {
    const length = routeFill.getTotalLength();
    routeFill.style.strokeDasharray = `${length}`;

    let rafId = null;
    const updateRoute = () => {
      rafId = null;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      routeFill.style.strokeDashoffset = `${length * (1 - progress)}`;
      if (routeDot) {
        const point = routeFill.getPointAtLength(length * progress);
        routeDot.setAttribute("cx", point.x);
        routeDot.setAttribute("cy", point.y);
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (rafId === null) rafId = window.requestAnimationFrame(updateRoute);
      },
      { passive: true }
    );
    window.addEventListener("resize", updateRoute);
    updateRoute();
  } else if (routeFill) {
    routeFill.style.strokeDashoffset = "0";
  }

  // Subtle card tilt on pointer move (desktop only, skipped for reduced motion)
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateZ(6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      });
    });
  }

  // Contact form: submit to Formspree via fetch, with a plain-POST fallback
  // if JavaScript fails (the form's action/method work on their own too).
  const form = document.querySelector("#contact-form");
  if (form) {
    const note = document.querySelector("#form-note");
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      // Honeypot: if this hidden field got filled in, it was a bot. Drop silently.
      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }

      // Guard against the placeholder Formspree ID never being replaced.
      if (form.action.includes("YOUR_FORM_ID")) {
        return; // let it submit natively so the error is visible, not silently swallowed
      }

      e.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      if (note) {
        note.textContent = "Sending…";
        note.style.color = "var(--text-faint)";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          if (note) {
            note.textContent = "Thanks — your enquiry is on its way. We'll reply within one business day.";
            note.style.color = "var(--gold-bright)";
          }
        } else {
          throw new Error("Form submission failed");
        }
      } catch (err) {
        if (note) {
          note.textContent = "Something went wrong sending that — please email hello@veldanalytics.com directly.";
          note.style.color = "#e08a6c";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
