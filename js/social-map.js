// Veld Analytics: dot-matrix world heat map (Social dashboard).
// Land mask = Natural Earth 1:110m land, rasterised to a Mercator dot grid.
// Audience shares are illustrative sample data, like the rest of the demo.
(function () {
  const W = 156, LAT_MIN = -56, LAT_MAX = 80;
  const RLE = ["36.11x2.21x16.4x28.3x35.","37.3x1.5x4.20x13.3x1.2x29.3x35.","32.1x4.3x1.4x4.21x13.4x32.2x1.1x33.","29.1x3.1x1.1x1.8x2.22x14.4x35.2x32.","34.3x1.1x1.5x1.23x14.3x1.1x33.2x33.","29.1x6.1x3.4x3.22x15.2x1.2x67.","26.2x12.4x4.22x14.2x36.2x32.","25.2x3.1x5.2x1.5x3.22x38.1x14.2x32.","25.1x2.1x1.1x3.2x1.2x9.21x35.4x12.7x29.","27.3x1.1x2.2x2.1x2.2x9.17x34.3x11.10x10.4x15.","27.1x1.3x2.1x1.1x1.5x10.16x33.2x12.11x11.5x13.","29.1x9.2x1.1x10.16x33.2x11.11x30.","24.4x9.2x15.15x32.2x12.11x30.","24.3x4.2x1.4x1.6x9.14x33.2x10.17x1.3x22.","24.2x1.5x2.2x3.4x1.1x9.13x34.1x6.1x1.1x2.21x4.3x15.","24.9x2.1x3.7x8.14x32.2x6.1x1.24x5.4x13.","1x9.1x16.6x3.2x2.7x8.13x32.55x1.","8.6x8.1x6.5x2.2x2.8x6.13x21.3x16.40x9.","7.11x2.3x2.1x1.7x1.1x1.2x2.1x3.4x5.1x1.12x18.6x12.2x1.2x1.41x1.3x1.","85x9.7x1.1x4.1x48.","1.83x12.1x1.1x57.","3.81x12.1x1.1x10.1x46.","1x3.79x10.3x60.","2x1.80x4.2x4.2x61.","8.32x1.2x3.4x5.5x8.3x11.5x1.67x1.","4.1x2.32x8.3x6.4x21.5x1.69x","6.32x5.4x9.4x20.6x1.67x2.","6.6x1.24x7.4x9.2x21.6x1.59x1.1x1.4x3.","8.5x4.20x7.4x32.6x4.55x3.1x7.","10.1x7.20x6.4x1.2x25.1x3.2x1.2x3.51x8.1x8.","9.1x1.1x8.18x7.6x24.2x5.3x2.51x8.3x7.","8.1x12.19x5.6x25.1x10.51x7.3x8.","21.21x2.9x21.1x1.1x10.50x8.3x8.","20.1x1.20x2.10x20.1x1.2x3.59x6.1x9.","23.20x1.10x20.1x1.3x1.60x6.1x9.","22.30x1.1x22.1x2.60x17.","23.1x1.23x1.1x3.2x22.62x1.1x15.","24.26x27.61x18.","24.26x1.1x25.14x1.1x1.5x2.37x18.","24.26x27.6x2.5x5.3x2.37x2.1x16.","24.23x27.5x4.1x2.4x6.3x2.34x4.1x16.","24.23x27.4x6.6x1.8x3.32x22.","24.21x29.4x9.1x1.10x2.28x3.1x23.","25.20x29.3x7.1x2.1x2.10x1.30x2.1x4.1x17.","26.19x30.1x1.6x11.36x3.1x2.3x17.","27.17x31.8x10.37x4.2x20.","27.16x31.11x2.2x4.38x3.1x21.","29.8x1.1x3.1x31.25x1.31x25.","28.1x1.6x6.1x29.20x1.6x2.29x26.","29.1x1.5x36.21x1.6x3.27x26.","30.1x1.4x35.22x2.8x5.21x1.1x25.","9.1x22.4x3.1x4.1x26.23x1.9x4.8x2.7x31.","10.1x22.3x3.1x6.2x23.23x2.7x7.5x4.5x1.1x30.","34.6x31.24x1.5x9.4x5.5x6.1x25.","38.4x28.26x1.3x10.3x7.5x5.1x25.","40.2x29.26x13.3x9.3x5.1x25.","41.1x3.4x1.2x20.28x11.1x11.1x7.1x24.","44.8x20.28x31.2x23.","44.11x19.4x2.19x22.2x5.1x27.","44.12x26.16x22.1x1.1x4.2x27.","44.12x26.15x24.1x3.4x1.1x2.1x22.","43.15x24.14x26.1x2.4x6.1x20.","43.18x22.12x27.2x6.1x3.1x1.4x16.","43.20x20.12x28.1x14.6x12.","44.19x21.11x31.2x10.2x1.1x14.","44.18x22.11x61.","45.17x22.12x3.1x35.2x2.1x16.","45.16x22.13x3.1x32.5x2.2x15.","47.14x22.12x2.2x33.6x1.2x15.","48.13x22.10x4.2x32.11x14.","48.12x24.9x4.2x29.15x13.","47.12x25.9x4.2x28.16x13.","47.10x27.8x35.17x12.","47.10x28.7x35.17x12.","47.9x29.6x37.16x12.","47.9x30.5x37.6x1.9x12.","47.8x31.3x39.4x6.6x12.","47.6x85.5x10.1x2.","46.7x86.4x13.","46.5x102.2x1.","46.5x105.","46.4x91.1x10.1x3.","46.4x101.1x4.","46.3x101.2x4.","45.4x107.","45.4x59.1x47.","45.3x108.","45.3x4.1x103.","47.2x107.","47.3x106."];
  const MASK = RLE.map((row) => {
    let out = "";
    (row.match(/\d+[x.]/g) || []).forEach((tok) => { out += (tok.slice(-1) === "x" ? "1" : "0").repeat(parseInt(tok, 10)); });
    return out;
  });
  const H = MASK.length;

  // name, lon, lat, reach radius (deg), weights [instagram, tiktok, meta]
  const C = [
    ["United Kingdom", -2.5, 53.5, 4.2, 22, 18, 16],
    ["Ireland", -8, 53.2, 2.6, 3, 2, 3],
    ["United States", -98, 39, 24, 20, 24, 15],
    ["Canada", -100, 58, 22, 4, 4, 4],
    ["Mexico", -102, 23.5, 9, 3, 3, 5],
    ["Brazil", -52, -11, 17, 5, 4, 7],
    ["Argentina", -64, -35, 11, 1.5, 1, 2.5],
    ["Colombia", -73, 4, 6, 1, 1, 2],
    ["Chile", -71, -33, 6, 1, 0.8, 1],
    ["Peru", -75, -10, 6, 1, 1, 1.5],
    ["Germany", 10.3, 51, 4, 4, 3, 2.5],
    ["France", 2.5, 46.5, 5, 3, 2.5, 2],
    ["Spain", -3.7, 40, 5, 2.5, 2.5, 2],
    ["Italy", 12.5, 42.5, 4.5, 2, 2, 1.5],
    ["Netherlands", 5.3, 52.2, 2.2, 2.5, 1.5, 1.5],
    ["Nordics", 15, 62, 9, 1.5, 1, 1],
    ["Poland", 19.4, 52, 4, 1, 1.5, 1],
    ["Ukraine", 31, 49, 6, 0.4, 0.4, 0.5],
    ["Turkey", 35, 39, 7, 2, 2.5, 2],
    ["Russia", 90, 60, 36, 0.8, 0.4, 0.6],
    ["Kazakhstan", 67, 48, 10, 0.3, 0.4, 0.4],
    ["Saudi Arabia", 45, 24, 8, 1.5, 2, 2],
    ["United Arab Emirates", 54, 24, 3, 1.5, 1.5, 1.5],
    ["Israel", 35, 31, 2, 0.8, 0.6, 0.6],
    ["Egypt", 30, 27, 6, 1, 1.5, 2.5],
    ["Nigeria", 8, 9.5, 6, 1, 1.5, 2.5],
    ["Kenya", 37.5, 0.5, 5, 0.5, 0.8, 1],
    ["South Africa", 24, -29, 8, 1.5, 1.5, 2],
    ["Ethiopia", 40, 8, 6, 0.2, 0.3, 0.5],
    ["DR Congo", 23.5, -3, 9, 0.2, 0.2, 0.4],
    ["Morocco", -6.5, 32, 5, 0.6, 0.8, 0.9],
    ["India", 79, 22.5, 11, 6, 3, 14],
    ["Pakistan", 69.5, 30, 7, 0.8, 0.8, 3],
    ["Bangladesh", 90.3, 23.8, 3.5, 0.5, 0.5, 2.5],
    ["China", 103, 35, 20, 0.3, 0.3, 0.3],
    ["Japan", 138, 37, 6, 1.5, 2, 0.8],
    ["South Korea", 128, 36.5, 2.5, 0.8, 1, 0.5],
    ["Indonesia", 114, -2, 15, 2.5, 6, 6],
    ["Philippines", 122, 12.5, 5.5, 1.5, 4, 5],
    ["Vietnam", 106, 16, 6, 0.8, 3.5, 5],
    ["Thailand", 101, 15, 5.5, 1, 3, 2.5],
    ["Malaysia", 109.5, 3.5, 7, 1, 2, 1.5],
    ["Australia", 134, -25, 20, 5, 3, 3],
    ["New Zealand", 174, -41, 6, 1, 0.8, 0.8],
  ];
  const PLATFORM_IDX = { instagram: 4, tiktok: 5, meta: 6 };
  const ASSIGN = { all: [4, 5, 6] };

  function hash(str) {
    let h = 2166136261;
    for (let k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  // Which country owns each land dot (scaled-nearest within its radius).
  const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const yMax = mercY(LAT_MAX), yMin = mercY(LAT_MIN);
  const stepLon = 360 / W, stepY = (stepLon * Math.PI) / 180;
  const dots = [];
  for (let r = 0; r < H; r++) {
    const y = yMax - r * stepY;
    const lat = ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
    for (let c = 0; c < W; c++) {
      if (MASK[r][c] !== "1") continue;
      const lon = -180 + stepLon * (c + 0.5);
      let best = -1, bestScore = 1;
      for (let k = 0; k < C.length; k++) {
        const dx = (lon - C[k][1]) * Math.cos((lat * Math.PI) / 180);
        const dy = lat - C[k][2];
        const score = Math.sqrt(dx * dx + dy * dy) / C[k][3];
        if (score < bestScore) { bestScore = score; best = k; }
      }
      dots.push({ r, c, owner: best, edge: bestScore });
    }
  }

  const VeldMap = {
    ready: false,
    init(root) {
      this.canvas = root.querySelector("#demo-map-canvas");
      this.tip = root.querySelector("#demo-map-tip");
      this.top = root.querySelector("#demo-map-top");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.cur = new Float32Array(dots.length);
      this.tgt = new Float32Array(dots.length);
      this.hover = -1;
      this.weights = C.map(() => 0);
      this.reach = 100000;
      this.resize();
      new ResizeObserver(() => { this.resize(); this.draw(); }).observe(this.canvas.parentElement);
      this.canvas.addEventListener("mousemove", (e) => this.onMove(e));
      this.canvas.addEventListener("mouseleave", () => { this.hover = -1; this.tip.classList.remove("visible"); this.draw(); });
      this.ready = true;
    },
    resize() {
      const w = this.canvas.parentElement.clientWidth || 600;
      const dpr = window.devicePixelRatio || 1;
      this.cssW = w;
      this.cssH = (w * H) / W;
      this.canvas.width = Math.round(this.cssW * dpr);
      this.canvas.height = Math.round(this.cssH * dpr);
      this.canvas.style.height = this.cssH + "px";
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.cell = this.cssW / W;
    },
    update(opts) {
      if (!this.ready) return;
      const pf = opts.platform || "all";
      const cols = pf === "all" ? ASSIGN.all : [PLATFORM_IDX[pf] || 4];
      this.reach = opts.reach || 100000;
      this.weights = C.map((row, k) => {
        const base = cols.reduce((a, ci) => a + row[ci], 0);
        const wob = 0.86 + 0.28 * hash(pf + "|" + opts.range + "|" + row[0]);
        return base * wob;
      });
      const max = Math.max(...this.weights);
      this.total = this.weights.reduce((a, b) => a + b, 0);
      this.norm = this.weights.map((w) => Math.pow(w / max, 0.5));
      dots.forEach((d, i) => {
        this.tgt[i] = d.owner < 0 ? 0 : this.norm[d.owner] * (1 - 0.3 * d.edge);
      });
      this.renderTop();
      this.animate();
    },
    renderTop() {
      if (!this.top) return;
      const order = C.map((_, k) => k).sort((a, b) => this.weights[b] - this.weights[a]).slice(0, 6);
      const mx = this.weights[order[0]];
      this.top.innerHTML = order
        .map((k) => {
          const share = (this.weights[k] / this.total) * 100;
          return '<div class="demo-map-row"><span class="n">' + C[k][0] + '</span><span class="p">' + share.toFixed(1) + '%</span><span class="b"><i style="width:' + ((this.weights[k] / mx) * 100).toFixed(0) + '%"></i></span></div>';
        })
        .join("");
    },
    animate() {
      if (this.raf) cancelAnimationFrame(this.raf);
      const step = () => {
        let moving = false;
        for (let i = 0; i < this.cur.length; i++) {
          const d = this.tgt[i] - this.cur[i];
          if (Math.abs(d) > 0.004) { this.cur[i] += d * 0.14; moving = true; } else this.cur[i] = this.tgt[i];
        }
        this.draw();
        this.raf = moving ? requestAnimationFrame(step) : 0;
      };
      this.raf = requestAnimationFrame(step);
    },
    color(v, a) {
      // dark blue -> blue -> pale ice
      const stops = [[34, 44, 84], [36, 87, 255], [130, 167, 255], [223, 247, 255]];
      const t = Math.min(1, Math.max(0, v)) * 3;
      const i = Math.min(2, Math.floor(t)), f = t - i;
      const c = stops[i].map((s, k) => Math.round(s + (stops[i + 1][k] - s) * f));
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    },
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.cssW, this.cssH);
      const cell = this.cell, rad = cell * 0.36;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const v = this.cur[i];
        const dim = this.hover >= 0 && d.owner !== this.hover;
        const on = this.hover >= 0 && d.owner === this.hover;
        let a, col;
        if (d.owner < 0 || v < 0.02) { col = "rgba(255,255,255," + (dim ? 0.05 : 0.1) + ")"; }
        else { a = (0.35 + 0.65 * v) * (dim ? 0.35 : 1); col = this.color(v, a); }
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc((d.c + 0.5) * cell, (d.r + 0.5) * cell, on ? rad * 1.18 : rad, 0, 6.2832);
        ctx.fill();
      }
    },
    onMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const c = Math.floor(x / this.cell), r = Math.floor(y / this.cell);
      let owner = -1, bestD = 3.2;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dist = Math.hypot(d.c - c, d.r - r);
        if (dist < bestD && d.owner >= 0) { bestD = dist; owner = d.owner; }
      }
      if (owner !== this.hover) { this.hover = owner; this.draw(); }
      if (owner < 0) { this.tip.classList.remove("visible"); return; }
      const share = (this.weights[owner] / this.total) * 100;
      const visitors = Math.round((this.reach * share) / 100);
      this.tip.innerHTML = '<div class="row"><span class="k">' + C[owner][0] + '</span></div><div class="row"><span class="k">Viewers</span><span class="val">' + visitors.toLocaleString("en-GB") + '</span></div><div class="row"><span class="k">Share</span><span class="val">' + share.toFixed(1) + '%</span></div>';
      this.tip.style.left = x + "px";
      this.tip.style.top = y + "px";
      this.tip.classList.add("visible");
    },
  };

  window.VeldMap = VeldMap;
})();
