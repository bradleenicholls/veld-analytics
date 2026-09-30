// Veld Analytics — homepage hero background: a reactive "shattered cube"
// centrepiece.
//
// Inspired by resend.com's rotating-cube hero (a 3x3x3 grid of gapped
// cubelets, slowly rotating, positioned beside the headline) — rebuilt
// from scratch in plain Three.js, since their version ships bundled and
// minified inside a Next.js app with no separate, readable source to
// pull from. Titanium-blue brushed-metal cubelets instead of their matte
// black, rim-lit with the site's own coral/blue accent pair.
//
// Swap-back note: the previous hero background (a wireframe terrain) is
// preserved untouched at js/hero-terrain-backup.js. To restore it:
// in index.html, change the canvas class "hero-cube" back to
// "hero-terrain" and the script src from hero-cube.js to
// hero-terrain-backup.js. Its CSS (.hero-terrain) is still in style.css.

(function () {
  const canvas = document.querySelector(".hero-cube");
  const heroEl = canvas ? canvas.closest(".hero-stack") : null;
  if (!canvas || !heroEl || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();

  const BASE_CAM = { x: 3.4, y: 2.2, z: 5.6 };
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(BASE_CAM.x, BASE_CAM.y, BASE_CAM.z);
  camera.lookAt(0, 0, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return; // WebGL unavailable — hero copy still reads fine with no background object
  }
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  else if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;

  // ---- Lighting ----
  // A high-metalness material needs light (or an environment map) to
  // read as metal at all — without one, MeshStandardMaterial renders
  // nearly black except at direct highlights. Rather than pull in an
  // HDRI/env-map loader (extra assets, extra complexity for a no-build
  // static site), this leans on a small rig of positioned lights: a cool
  // hemisphere fill, a white key light casting the contact shadow, and
  // two coloured point lights (coral + blue, the site's own accent
  // pair) standing in for rim/bounce light.
  const hemi = new THREE.HemisphereLight(0x9fc3e6, 0x090a0d, 0.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xeaf2ff, 1.5);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const rimCoral = new THREE.PointLight(0xff7759, 7, 14);
  rimCoral.position.set(-3.2, 1.6, -2.4);
  scene.add(rimCoral);

  const fillBlue = new THREE.PointLight(0x82a7ff, 5, 14);
  fillBlue.position.set(2.6, -1.2, 3.2);
  scene.add(fillBlue);

  // ---- Cubelets: 3x3x3 grid, gapped and lightly jittered per-cube so it
  // reads as fragmented/exploded rather than a solid block. ----
  const group = new THREE.Group();
  const CUBE_SIZE = 0.86;
  const SPACING = 1.04;
  const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);

  const TITANIUM = 0x4d6b84; // titanium blue
  const TITANIUM_LIGHT = 0x87acc9; // brushed highlight accent cubelets

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  let seed = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        seed++;
        const isAccent = seededRandom(seed) > 0.8;
        const material = new THREE.MeshStandardMaterial({
          color: isAccent ? TITANIUM_LIGHT : TITANIUM,
          metalness: 0.82,
          roughness: isAccent ? 0.22 : 0.4,
        });
        const mesh = new THREE.Mesh(geometry, material);
        const jitter = (seededRandom(seed * 3.7) - 0.5) * 0.07;
        mesh.position.set(x * SPACING + jitter, y * SPACING + jitter, z * SPACING + jitter);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    }
  }
  scene.add(group);

  // Soft contact shadow beneath the cube.
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.4 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.95;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

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
    const rect = canvas.getBoundingClientRect();
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
      group.rotation.y = t * 0.18;
      group.rotation.x = Math.sin(t * 0.3) * 0.08;
    }

    targetX += (pointerX - targetX) * 0.04;
    targetY += (pointerY - targetY) * 0.04;
    camera.position.x = BASE_CAM.x + targetX * 0.6;
    camera.position.y = BASE_CAM.y + targetY * -0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    if (!readyShown) {
      readyShown = true;
      canvas.classList.add("is-ready");
    }
  }
  animate();
})();
