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

  // ---- Cubelets: 3x3x3 grid, flush against each other (no gaps) so it
  // reads as one solid cube rather than a scattered set of blocks.
  // Wrapped in a "rig" purely so the whole assembly can be scaled down
  // 20% in one place without re-deriving every position number. ----
  const rig = new THREE.Group();
  rig.scale.setScalar(0.8);
  scene.add(rig);

  const group = new THREE.Group();
  rig.add(group);

  const CUBE_SIZE = 1;
  const SPACING = 1.001; // just enough to avoid z-fighting between touching faces
  const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);

  const TITANIUM = "#4d6b84";
  const TITANIUM_DARK = "#33475a";
  const TITANIUM_LIGHT = "#87acc9";

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // ---- Procedural surface patterns ----
  // The reference photo's cube isn't one flat material — different
  // cubelets show a perforated/dot grid, a fine speckled grain, ribbed
  // vertical lines, a smooth glossy face, or plain brushed metal. Rather
  // than load texture images (extra assets for a no-build static site),
  // each pattern is drawn once onto a small canvas and reused as a
  // THREE.CanvasTexture — still titanium-blue throughout, just varying
  // surface detail, matching what the photo actually shows.
  const textureCache = {};
  function getTexture(kind) {
    if (textureCache[kind]) return textureCache[kind];
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = TITANIUM;
    ctx.fillRect(0, 0, size, size);

    if (kind === "dots") {
      ctx.fillStyle = TITANIUM_DARK;
      for (let gy = 6; gy < size; gy += 14) {
        for (let gx = 6; gx < size; gx += 14) {
          ctx.beginPath();
          ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (kind === "speckle") {
      for (let i = 0; i < 900; i++) {
        const v = Math.random();
        ctx.fillStyle = v > 0.5 ? TITANIUM_LIGHT : TITANIUM_DARK;
        ctx.globalAlpha = Math.random() * 0.5;
        ctx.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    } else if (kind === "ribbed") {
      ctx.fillStyle = TITANIUM_DARK;
      for (let gx = 0; gx < size; gx += 8) {
        ctx.fillRect(gx, 0, 3, size);
      }
      ctx.fillStyle = TITANIUM_LIGHT;
      ctx.globalAlpha = 0.35;
      for (let gx = 3; gx < size; gx += 8) {
        ctx.fillRect(gx, 0, 1.5, size);
      }
      ctx.globalAlpha = 1;
    } else if (kind === "glossy") {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, TITANIUM_LIGHT);
      grad.addColorStop(0.45, TITANIUM);
      grad.addColorStop(1, TITANIUM_DARK);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    // "plain" kind: just the flat base fill already drawn above.

    const texture = new THREE.CanvasTexture(c);
    if ("colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    textureCache[kind] = texture;
    return texture;
  }

  const PATTERN_KINDS = ["plain", "plain", "plain", "dots", "speckle", "ribbed", "glossy"];

  let seed = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        seed++;
        const kind = PATTERN_KINDS[Math.floor(seededRandom(seed) * PATTERN_KINDS.length)];
        const material = new THREE.MeshStandardMaterial({
          map: getTexture(kind),
          metalness: 0.8,
          roughness: kind === "glossy" ? 0.15 : kind === "plain" ? 0.35 : 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x * SPACING, y * SPACING, z * SPACING);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Grid coordinates, tracked separately from render position —
        // layer twists select cubelets by these, and get rotated 90°
        // along with the mesh so later twists still pick the right set
        // after earlier moves have reshuffled the cube.
        mesh.userData.grid = { x, y, z };
        group.add(mesh);
      }
    }
  }

  // Soft contact shadow beneath the cube.
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.4 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.6;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // ---- Rubik's-style layer twists ----
  // Every couple of seconds, pick a random axis + layer (a 3x3 slice of
  // 9 cubelets) and rotate just that slice 90°, like an actual solve
  // move — rather than just spinning the whole assembly as one rigid
  // block. Only one twist runs at a time. THREE.Object3D#attach (r128)
  // reparents a mesh while preserving its *world* transform, so cubelets
  // can move between the pivot and the main group mid-scene without any
  // manual matrix math.
  const AXES = ["x", "y", "z"];
  const TWIST_DURATION = 0.68; // seconds
  let twist = null; // { axis, dir, pivot, meshes, elapsed }
  let nextTwistAt = 1.4;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function startTwist() {
    const axis = AXES[Math.floor(Math.random() * 3)];
    const layer = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const dir = Math.random() < 0.5 ? 1 : -1;

    const meshes = group.children.filter((m) => m.userData.grid[axis] === layer);
    if (!meshes.length) return; // shouldn't happen, but skip rather than twist nothing

    const pivot = new THREE.Group();
    group.add(pivot);
    meshes.forEach((m) => pivot.attach(m));

    twist = { axis, dir, pivot, meshes, elapsed: 0 };
  }

  function updateTwist(dt, t) {
    if (!twist) return;
    twist.elapsed += dt;
    const p = Math.min(twist.elapsed / TWIST_DURATION, 1);
    const angle = easeInOutCubic(p) * (Math.PI / 2) * twist.dir;
    twist.pivot.rotation[twist.axis] = angle;

    if (p >= 1) {
      // Bake the 90° turn into each cubelet's own transform, reparent
      // back to the main group, and rotate its stored grid coordinate
      // to match — so the next twist that picks this layer again
      // selects the right cubelets.
      const { axis: a, dir } = twist;
      twist.meshes.forEach((m) => {
        group.attach(m);
        const g = m.userData.grid;
        if (a === "x") {
          const { y, z } = g;
          g.y = dir > 0 ? -z : z;
          g.z = dir > 0 ? y : -y;
        } else if (a === "y") {
          const { x, z } = g;
          g.x = dir > 0 ? z : -z;
          g.z = dir > 0 ? -x : x;
        } else {
          const { x, y } = g;
          g.x = dir > 0 ? -y : y;
          g.y = dir > 0 ? x : -x;
        }
      });
      group.remove(twist.pivot);
      twist = null;
      nextTwistAt = t + 1.6 + Math.random() * 1.6;
    }
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

  // Single time source for the whole frame — Three.js's Clock advances
  // its internal delta every time getElapsedTime()/getDelta() is called,
  // so calling it more than once per frame would silently double-count.
  // Everything below derives dt from one call and passes it around.
  const clock = new THREE.Clock();
  let lastT = 0;
  let readyShown = false;

  function animate() {
    requestAnimationFrame(animate);
    if (!heroVisible || !tabVisible) {
      lastT = clock.getElapsedTime(); // keep dt sane for the frame after we resume
      return;
    }

    const t = clock.getElapsedTime();
    const dt = Math.min(t - lastT, 0.1);
    lastT = t;

    if (!reduceMotion) {
      // Continuous whole-cube rotation, same as the very first version,
      // plus a gentle wobble — with individual layers also twisting on
      // top of it (a pivot's local rotation composes fine with its
      // spinning parent, so this looks like someone turning faces on a
      // cube that's slowly tumbling in space, not two effects fighting).
      group.rotation.y = t * 0.18;
      group.rotation.x = Math.sin(t * 0.3) * 0.08;

      if (!twist && t >= nextTwistAt) startTwist();
      updateTwist(dt, t);
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
