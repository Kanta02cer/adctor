/* ヒーロー背景：三角形の幾何学模様（ローポリ）
   - カーソルの近くの頂点が押し出され、面が盛り上がって光る
   - カーソルがないとき（スマホなど）は、ゆっくりした波で動く
   - 「動き：OFF」や、動きを減らす設定では止まった模様だけを描く */
(() => {
  const canvas = document.getElementById('heroGeo');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('top');
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ブランドの青の幅（白い文字が読める明るさの範囲に収める）
  const DEEP = [10, 46, 214];
  const BASE = [22, 75, 255];
  const LIGHT = [74, 118, 255];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const L = (() => { const v = [-0.45, -0.6, 0.66]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

  let W = 0; let H = 0; let dpr = 1; let s = 80; let rowH = 70;
  let pts = []; let cols = 0; let rows = 0;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false };

  // 再現できる乱数（毎回同じ模様になる）
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const build = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s = Math.max(54, Math.min(110, W / 15));
    rowH = s * 0.866;
    cols = Math.ceil(W / s) + 3;
    rows = Math.ceil(H / rowH) + 3;
    seed = 7;
    pts = [];
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const bx = (i - 1) * s + (j % 2 ? s / 2 : 0) + (rand() - 0.5) * s * 0.36;
        const by = (j - 1) * rowH + (rand() - 0.5) * rowH * 0.36;
        pts.push({ bx, by, x: bx, y: by, ox: 0, oy: 0, z: 0, vx: 0, vy: 0, vz: 0, ph: rand() * Math.PI * 2 });
      }
    }
  };
  const P = (i, j) => pts[j * cols + i];

  const shade = (a, b, c, glow) => {
    const h = s * 1.1;
    const ux = b.x - a.x; const uy = b.y - a.y; const uz = (b.z - a.z) * h;
    const vx = c.x - a.x; const vy = c.y - a.y; const vz = (c.z - a.z) * h;
    let nx = uy * vz - uz * vy; let ny = uz * vx - ux * vz; let nz = ux * vy - uy * vx;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const n = Math.hypot(nx, ny, nz) || 1;
    const d = (nx * L[0] + ny * L[1] + nz * L[2]) / n; // 0.66 前後が平らな面
    const t = Math.max(0, Math.min(1, (d - 0.3) / 0.62));
    let col = t < 0.55 ? mix(DEEP, BASE, t / 0.55) : mix(BASE, LIGHT, (t - 0.55) / 0.45);
    if (glow > 0) col = mix(col, LIGHT, Math.min(0.55, glow * 0.6));
    return `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    for (let j = 0; j < rows - 1; j += 1) {
      for (let i = 0; i < cols - 1; i += 1) {
        // 偶数行と奇数行でずれた格子を、三角形2枚ずつに分ける
        const a = P(i, j); const b = P(i + 1, j);
        const c = P(i, j + 1); const d = P(i + 1, j + 1);
        const tris = j % 2 ? [[a, d, c], [a, b, d]] : [[a, b, c], [b, d, c]];
        for (const [p, q, r] of tris) {
          const glow = (p.z + q.z + r.z) / 3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.lineTo(r.x, r.y); ctx.closePath();
          ctx.fillStyle = shade(p, q, r, glow);
          ctx.fill();
          ctx.strokeStyle = `rgba(255,255,255,${(0.07 + Math.min(0.28, glow * 0.4)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    // カーソルの近くの頂点に、小さな光の点
    for (const p of pts) {
      if (p.z > 0.12) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 + p.z * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, p.z * 0.9).toFixed(3)})`;
        ctx.fill();
      }
    }
  };

  const step = (t) => {
    mouse.x += (mouse.tx - mouse.x) * 0.18;
    mouse.y += (mouse.ty - mouse.y) * 0.18;
    const R = Math.max(180, Math.min(320, W * 0.2));
    for (const p of pts) {
      // ゆっくりした波（常に少しだけ動く）
      const wave = Math.sin(t * 0.0005 + p.bx * 0.004 + p.by * 0.006 + p.ph * 0.6) * 0.18;
      let tx = 0; let ty = 0; let tz = wave;
      if (mouse.on) {
        const dx = p.bx - mouse.x; const dy = p.by - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < R) {
          const f = (1 - dist / R) ** 2;
          const k = (f * s * 0.42) / (dist || 1);
          tx = dx * k; ty = dy * k; tz += f * 1.25;
        }
      }
      p.vx = (p.vx + (tx - p.ox) * 0.07) * 0.84;
      p.vy = (p.vy + (ty - p.oy) * 0.07) * 0.84;
      p.vz = (p.vz + (tz - p.z) * 0.07) * 0.84;
      p.ox += p.vx; p.oy += p.vy; p.z += p.vz;
      p.x = p.bx + p.ox; p.y = p.by + p.oy;
    }
  };

  // 画面に出ていて、動きを止めていないときだけ動かす
  let visible = true;
  let raf = 0;
  const paused = () => reduce || root.classList.contains('is-motion-paused');
  const loop = (t) => {
    raf = 0;
    if (!visible || paused()) return;
    step(t);
    draw();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && visible && !paused()) raf = requestAnimationFrame(loop); };

  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
  };
  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      toLocal(e);
      if (!mouse.on) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.on = true; }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouse.on = false; });
  } else {
    // タッチでは、触れた場所が一瞬盛り上がる
    hero.addEventListener('pointerdown', (e) => { toLocal(e); mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.on = true; setTimeout(() => { mouse.on = false; }, 700); }, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; start(); }).observe(hero);
  }
  // 「動き：ON／OFF」ボタンに合わせて止める・再開する
  new MutationObserver(() => { if (paused()) { step(0); draw(); } else start(); }).observe(root, { attributes: true, attributeFilter: ['class'] });

  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); step(0); draw(); start(); }, 120); });
  build();
  step(0);
  draw();
  start();
})();
