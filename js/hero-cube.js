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
  // Neutral, mostly-white lighting rig — no blue/coral colour casts on
  // the metal itself. One strong key light still does the work of the
  // crisp specular glints (low roughness needs a concentrated source to
  // "catch" light rather than spreading it), but everything else is
  // turned up from before so the cube reads as consistently lit overall
  // — like it's floating in its own pool of light — rather than mostly
  // black with a few bright spots.
  const ambient = new THREE.AmbientLight(0x9a9ea3, 0.55);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xaab0b8, 0x1c1e21, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const rimCoral = new THREE.PointLight(0xc7cdd4, 1.5, 16);
  rimCoral.position.set(-3.2, 1.6, -2.4);
  scene.add(rimCoral);

  const fillBlue = new THREE.PointLight(0xb4b9c0, 1.3, 16);
  fillBlue.position.set(2.6, -1.2, 3.2);
  scene.add(fillBlue);

  // Soft front fill near the camera, so the faces actually facing the
  // viewer stay visible/readable rather than falling into shadow once
  // the cube's twist/tumble turns a dark side toward us.
  const frontFill = new THREE.PointLight(0xc4c8cc, 0.9, 16);
  frontFill.position.set(BASE_CAM.x, BASE_CAM.y, BASE_CAM.z);
  scene.add(frontFill);

  // ---- Cubelets: 3x3x3 grid, flush against each other (no gaps) so it
  // reads as one solid cube rather than a scattered set of blocks.
  // Wrapped in a "rig" purely so the whole assembly can be scaled down
  // 20% in one place without re-deriving every position number. ----
  const rig = new THREE.Group();
  rig.scale.setScalar(0.5184); // another 10% down from 0.576
  scene.add(rig);

  const group = new THREE.Group();
  rig.add(group);

  const CUBE_SIZE = 1;
  // Flush — no gap between cubelets, reads as one solid block. Safe at
  // exactly CUBE_SIZE now the corner radius is tiny (no rounded bevel
  // to open a visible seam at the join).
  const SPACING = 1;

  // Rounded/soft edges. The CDN build of three.js (three.min.js) doesn't
  // include the examples/addons RoundedBoxGeometry, so this is a small
  // hand-rolled version of the same standard technique: start from a
  // subdivided box, then pull every vertex toward the surface of a
  // rounded corner (clamp to an inset box, then push out along the
  // remaining offset by the bevel radius), and recompute normals so
  // lighting treats it as genuinely curved rather than faceted.
  function createRoundedBoxGeometry(size, radius, segments) {
    const geo = new THREE.BoxGeometry(size, size, size, segments, segments, segments);
    const half = size / 2;
    const inner = half - radius;
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const cx = THREE.MathUtils.clamp(v.x, -inner, inner);
      const cy = THREE.MathUtils.clamp(v.y, -inner, inner);
      const cz = THREE.MathUtils.clamp(v.z, -inner, inner);
      const dx = v.x - cx;
      const dy = v.y - cy;
      const dz = v.z - cz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist > 1e-6) {
        const scale = radius / dist;
        v.set(cx + dx * scale, cy + dy * scale, cz + dz * scale);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }
  // A small radius just takes the razor edge off so it doesn't alias —
  // this used to be 0.14 (a visibly rounded, "puffy" bevel); a real
  // Rubik's cube panel reads as flat and sharp-edged, not soft.
  const geometry = createRoundedBoxGeometry(CUBE_SIZE, 0.025, 2);

  const BASE_BLACK = "#050506"; // cube body — true black, no colour tint
  const STEEL = "#2c2c2e"; // dark-grey pattern accents — no blue anywhere
  const STEEL_DARK = "#141416";
  const STEEL_LIGHT = "#47474a";

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // ---- Procedural surface patterns ----
  // Kept subtle on purpose — every cubelet is still the same dark-grey/
  // black metal, just with slightly different micro-surface detail
  // (tiny perforation, fine grain, smooth gloss, plain), close enough in
  // tone that they read as one consistent material rather than a set of
  // visibly different panels. Each pattern is drawn once onto a small
  // canvas and reused as a THREE.CanvasTexture.
  const textureCache = {};
  function getTexture(kind) {
    if (textureCache[kind]) return textureCache[kind];
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = BASE_BLACK;
    ctx.fillRect(0, 0, size, size);

    if (kind === "perforated") {
      // Small, tightly-packed holes rather than the previous bigger dot
      // grid — reads as a perforated metal panel, still mostly black.
      ctx.fillStyle = STEEL_DARK;
      ctx.globalAlpha = 0.6;
      for (let gy = 5; gy < size; gy += 9) {
        for (let gx = 5; gx < size; gx += 9) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    } else if (kind === "speckle") {
      for (let i = 0; i < 700; i++) {
        const v = Math.random();
        ctx.fillStyle = v > 0.5 ? STEEL_LIGHT : STEEL_DARK;
        ctx.globalAlpha = Math.random() * 0.22;
        ctx.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    } else if (kind === "glossy") {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, STEEL_LIGHT);
      grad.addColorStop(0.45, STEEL);
      grad.addColorStop(1, STEEL_DARK);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1;
    }
    // "plain" kind: just the flat base fill already drawn above.

    const texture = new THREE.CanvasTexture(c);
    if ("colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    textureCache[kind] = texture;
    return texture;
  }

  const PATTERN_KINDS = ["plain", "plain", "plain", "plain", "plain", "perforated", "speckle", "glossy"];

  let seed = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        seed++;
        const kind = PATTERN_KINDS[Math.floor(seededRandom(seed) * PATTERN_KINDS.length)];
        const material = new THREE.MeshStandardMaterial({
          map: getTexture(kind),
          metalness: 0.97,
          roughness: kind === "glossy" ? 0.1 : kind === "plain" ? 0.14 : 0.22,
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
      // Continuous whole-cube tumble — individual layers also twist on
      // top of it (a pivot's local rotation composes fine with its
      // spinning parent). Each axis is a sum of two sine waves at
      // different, non-matching frequencies rather than one steady spin,
      // so it drifts up/down and side to side rather than just yawing
      // right, and never quite repeats the same path.
      group.rotation.y = t * 0.62 + Math.sin(t * 0.23) * 0.9 + Math.sin(t * 0.51 + 2.2) * 0.3;
      group.rotation.x = Math.sin(t * 0.45) * 0.55 + Math.sin(t * 0.19 + 1.7) * 0.35;
      group.rotation.z = Math.sin(t * 0.33 + 0.8) * 0.45 + Math.sin(t * 0.14) * 0.25;

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
