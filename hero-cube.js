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
  // ---- Studio reflection map ----
  // Why the cube kept swinging between "black void" and "washed-out
  // grey": real polished metal doesn't get brighter from more lights, it
  // shows whatever it REFLECTS. With nothing around it to reflect, it's
  // black except for the one angle where a lamp bounces into the camera;
  // lowering metalness to fix that just turned it into grey plastic.
  // Product photographers solve this by surrounding black chrome with
  // softboxes. This builds the same thing in code (no image files): a
  // dark room containing a few bright panels, baked once into an
  // environment map via PMREMGenerator. The cube stays black wherever it
  // reflects the dark room and picks up bright streaks wherever it
  // reflects a panel — and since there are several panels spread around,
  // there's always some reflection visible on it as it tumbles.
  try {
    const envScene = new THREE.Scene();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(40, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x020203, side: THREE.BackSide })
    );
    envScene.add(room);
    const addPanel = (w, h, x, y, z, intensity, tint) => {
      const colour = new THREE.Color(tint).multiplyScalar(intensity); // >1 = HDR brightness
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: colour, side: THREE.DoubleSide })
      );
      panel.position.set(x, y, z);
      panel.lookAt(0, 0, 0);
      envScene.add(panel);
    };
    addPanel(9, 6, 8, 9, 5, 6, 0xffffff); // main softbox, upper right (same side as the CSS beam)
    addPanel(2.5, 14, -10, 1, 2, 3.2, 0xe4ecff); // tall strip, left
    addPanel(12, 12, 0, 13, 0, 1.8, 0xffffff); // overhead
    addPanel(12, 2.5, -3, 3, -11, 3.5, 0xffffff); // rim strip behind
    addPanel(10, 5, 4, -9, 3, 1.3, 0xffffff); // low floor-bounce panel
    addPanel(8, 8, -5, 0, 11, 1.1, 0xffffff); // dim front fill so camera-facing sides keep a gradient
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.03).texture;
    pmrem.dispose();
  } catch (err) {
    // If the environment map can't be built, the direct lights below
    // still light the cube — it just loses the always-on reflections.
  }

  // Direct lights are supporting cast now — the environment does the
  // main work — so these are kept low.
  const ambient = new THREE.AmbientLight(0x9a9ea3, 0.08);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xaab0b8, 0x1c1e21, 0.08);
  scene.add(hemi);

  // An actual THREE.SpotLight — a real cone of light with an angle,
  // soft-edged penumbra and distance falloff, rather than the plain
  // DirectionalLight (flat parallel rays, no cone, no falloff) this was
  // using before. Positioned up and to the right of the cube so it
  // reads as a spotlight shining down onto it, matching the direction
  // of the CSS spotlight beam behind it. A single light still only
  // produces a glint where it happens to catch a face as the cube
  // tumbles, which is why it's surrounded by the several dimmer fill
  // lights below — those keep something lit at all times; this one is
  // the actual visible "spotlight" source.
  const key = new THREE.SpotLight(0xffffff, 1.6, 22, THREE.MathUtils.degToRad(30), 0.5, 1);
  key.position.set(4, 6, 4);
  key.target.position.set(0, 0, 0);
  scene.add(key.target);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rimCoral = new THREE.PointLight(0xc7cdd4, 0.35, 16);
  rimCoral.position.set(-3.2, 1.6, -2.4);
  scene.add(rimCoral);

  const fillBlue = new THREE.PointLight(0xb4b9c0, 0.32, 16);
  fillBlue.position.set(2.6, -1.2, 3.2);
  scene.add(fillBlue);

  // Soft front fill near the camera, so the faces actually facing the
  // viewer stay visible/readable rather than falling into shadow once
  // the cube's twist/tumble turns a dark side toward us.
  const frontFill = new THREE.PointLight(0xc4c8cc, 0.32, 16);
  frontFill.position.set(BASE_CAM.x, BASE_CAM.y, BASE_CAM.z);
  scene.add(frontFill);

  // Two extra low-key lights from angles none of the others cover (top
  // and far side) — purely to keep a faint glint somewhere on the cube
  // at all times as it tumbles, not to add overall brightness.
  const topFill = new THREE.PointLight(0xbfc3c8, 0.26, 16);
  topFill.position.set(0, 4.2, 0.6);
  scene.add(topFill);

  const farFill = new THREE.PointLight(0xb8bcc2, 0.24, 16);
  farFill.position.set(-2.2, -2.6, 2.8);
  scene.add(farFill);

  // ---- Cubelets: 3x3x3 grid, flush against each other (no gaps) so it
  // reads as one solid cube rather than a scattered set of blocks.
  // Wrapped in a "rig" purely so the whole assembly can be scaled down
  // 20% in one place without re-deriving every position number. ----
  const rig = new THREE.Group();
  rig.scale.setScalar(0.41861); // another 15% down from 0.49248
  rig.position.y = 0.34; // nudged up again, higher in the frame
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

  // For a metal, the base colour is its REFLECTIVITY, not how dark it
  // looks: the near-black values used before meant it only reflected
  // ~2% of whatever was around it, so it stayed dark no matter what
  // lighting was added. A mid-grey gunmetal reflects enough to show the
  // studio environment above, and still reads black wherever that
  // environment is dark. Neutral grey throughout — no blue.
  const BASE_METAL = "#76767b";
  const STEEL = "#58585d"; // pattern accents, relative to the base above
  const STEEL_DARK = "#2a2a2e";
  const STEEL_LIGHT = "#9c9ca1";

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
    ctx.fillStyle = BASE_METAL;
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
          // Back to near-full metalness — the studio reflection map
          // above is what keeps it visible now, so there's no need to
          // trade away the metal look (lower metalness is what turned
          // it into grey plastic). Roughness is a touch higher than the
          // mirror-sharp values from earlier so the reflected panels
          // read as broad soft streaks across the faces, which show up
          // at far more angles than a tight mirror glint does.
          metalness: 0.96,
          roughness: kind === "glossy" ? 0.16 : kind === "plain" ? 0.24 : 0.32,
          envMapIntensity: 1,
          // Multiplies the texture colour down so overall reflectivity
          // lands on dark gunmetal rather than bright silver (tuned by
          // eye in a live render: 1.0 read as aluminium, ~0.3-0.4 reads as
          // black metal with visible reflections). This is the single
          // dial for "how light is the cube" — lower = darker/blacker,
          // higher = more silver.
          color: new THREE.Color(0.4, 0.4, 0.4),
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
