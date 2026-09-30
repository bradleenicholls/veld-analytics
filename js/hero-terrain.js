// Veld Analytics — homepage hero background: a reactive wireframe terrain.
//
// Three.js (CDN, global THREE — no build step, same pattern as the rest
// of this site). Sits behind the hero copy/dashboard as a quiet,
// mouse-reactive atmosphere: a rolling wireframe plane, tinted coral near
// the camera fading to blue at the horizon (the site's own --coral and
// --gold tokens), gently undulating over time and tilting toward the
// cursor. Homepage only.
//
// Performance/accessibility guards: skips entirely if THREE didn't load
// or the canvas is missing; freezes the terrain's undulation (camera
// parallax still runs, just no per-vertex motion) under prefers-reduced-
// motion; stops rendering while the tab is hidden or the hero has
// scrolled out of view; capped pixel ratio.

(function () {
  const canvas = document.querySelector(".hero-terrain");
  const heroEl = canvas ? canvas.closest(".hero-stack") : null;
  if (!canvas || !heroEl || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x17171c, 5, 15);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const BASE_Y = 2.5;
  camera.position.set(0, BASE_Y, 6);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return; // WebGL unavailable — leave the plain ambient glow/dot-grid as the fallback
  }
  renderer.setClearColor(0x000000, 0);

  const SIZE = 22;
  const SEGMENTS = 50;
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geometry.rotateX(-Math.PI / 2);

  const position = geometry.attributes.position;
  const baseY = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) baseY[i] = position.getY(i);

  // Colour gradient across the field — coral near the camera fading to
  // blue toward the horizon, matching --coral (#ff7759) / --gold (#82a7ff).
  const colors = new Float32Array(position.count * 3);
  const coral = new THREE.Color(0xff7759);
  const blue = new THREE.Color(0x82a7ff);
  for (let i = 0; i < position.count; i++) {
    const z = position.getZ(i);
    const t = THREE.MathUtils.clamp((z + SIZE / 2) / SIZE, 0, 1);
    const c = coral.clone().lerp(blue, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0.24,
    vertexColors: true,
    fog: true,
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.position.z = -2;
  scene.add(terrain);

  // Cheap sum-of-sines "noise" — no external noise library, just enough
  // irregularity to read as rolling terrain rather than a uniform wave.
  function ripple(x, z, t) {
    return (
      Math.sin(x * 0.45 + t) * 0.5 +
      Math.sin(z * 0.35 - t * 0.8) * 0.4 +
      Math.sin((x + z) * 0.25 + t * 0.6) * 0.3
    );
  }

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  function resize() {
    const rect = heroEl.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let heroVisible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    ).observe(heroEl);
  }

  let tabVisible = true;
  document.addEventListener("visibilitychange", () => {
    tabVisible = document.visibilityState === "visible";
  });

  const clock = new THREE.Clock();
  let readyShown = false;

  function animate() {
    requestAnimationFrame(animate);
    if (!heroVisible || !tabVisible) return;

    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const z = position.getZ(i);
        position.setY(i, baseY[i] + ripple(x, z, t * 0.35) * 0.5);
      }
      position.needsUpdate = true;
    }

    targetX += (pointerX - targetX) * 0.04;
    targetY += (pointerY - targetY) * 0.04;
    camera.position.x = targetX * 1.3;
    camera.position.y = BASE_Y + targetY * -0.5;
    camera.lookAt(0, 0, -2);

    renderer.render(scene, camera);

    if (!readyShown) {
      readyShown = true;
      canvas.classList.add("is-ready");
    }
  }
  animate();
})();
