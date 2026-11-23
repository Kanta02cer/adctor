/* Trillion Bank — 3Dシーン（外部ライブラリなし・Canvas 2Dで透視投影）
   - TBOpening：オープニング。データの粒が奥から流れ込み、ロゴの3枚のフレームが空間から飛来して並び、
                 光のリボン（青い線）が3枚を通り抜け、正面を向いたところでロゴになる。
   - TBTerrain：ヒーロー背景。等高線のように流れる3Dの線群。マウスで視点が少し傾く。
   - TBFrames ：ゆっくり回転する立体のロゴ（3枚のフレーム＋リボン）。
*/
(() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeIO = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const lerp = (a, b, t) => a + (b - a) * t;

  // ロゴの3枚のフレーム（414×318の座標系）を中心原点・単位系に変換
  const RAW = [
    [[103, 74], [168, 42], [168, 214], [103, 247]],
    [[183, 97], [248, 64], [248, 236], [183, 268]],
    [[263, 108], [327, 75], [327, 248], [263, 281]],
  ];
  const CX = 215; const CY = 161; const S = 1 / 120;
  const FRAMES = RAW.map((q) => q.map(([x, y]) => [(x - CX) * S, -(y - CY) * S]));
  // 波（リボン）の2D形状：ロゴの線と同じ起伏
  const waveY = (x) => { // x: -1.7..1.7 (unit)
    const px = x / S + CX;
    let y = 165;
    if (px > 105 && px < 166) y = 165 - 28 * (0.5 - 0.5 * Math.cos(Math.PI * (px - 105) / 61));
    else if (px >= 166 && px < 256) y = 137 + 54 * (0.5 - 0.5 * Math.cos(Math.PI * (px - 166) / 90));
    else if (px >= 256 && px < 322) y = 191 - 26 * (0.5 - 0.5 * Math.cos(Math.PI * (px - 256) / 66));
    return -(y - CY) * S;
  };

  function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: r.width, h: r.height };
    };
    return { ctx, resize };
  }

  // 3D点 → 画面（yaw:Y軸回転, pitch:X軸回転, cam:カメラ距離）
  function makeProjector(w, h, fov = 1.1) {
    const f = (h / 2) / Math.tan(fov / 2);
    return (x, y, z, yaw, pitch, dist, ox = 0, oy = 0) => {
      const cy = Math.cos(yaw); const sy = Math.sin(yaw);
      let X = x * cy + z * sy; let Z = -x * sy + z * cy;
      const cp = Math.cos(pitch); const sp = Math.sin(pitch);
      const Y = y * cp - Z * sp; Z = y * sp + Z * cp;
      const zz = Z + dist;
      if (zz <= 0.05) return null;
      const k = f / zz;
      return [w / 2 + ox + X * k, h / 2 + oy - Y * k, k, zz];
    };
  }

  /* ---------------------------------------------------------------------
     OPENING
     --------------------------------------------------------------------- */
  function TBOpening(canvas, { duration = 3600, onLogo, onDone } = {}) {
    const { ctx, resize } = setupCanvas(canvas);
    let size = resize();
    let proj = makeProjector(size.w, size.h);
    const onR = () => { size = resize(); proj = makeProjector(size.w, size.h); };
    window.addEventListener('resize', onR);

    // データの粒
    const N = Math.round(Math.min(900, size.w * size.h / 1400));
    const pts = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 14, y: (Math.random() - 0.5) * 9, z: Math.random() * 40 + 2, s: Math.random() }));
    // フレームの飛来元（ばらばらの位置・回転）
    const fly = FRAMES.map((_, i) => ({ dx: [-6, 0.5, 6][i], dy: [3, -4, 2.5][i], dz: [18, 26, 14][i], rot: [2.4, -1.8, 3.1][i] }));
    let start = null; let raf; let logoFired = false; let stopped = false;

    const frame = (now) => {
      if (stopped) return;
      if (start === null) start = now;
      const t = (now - start) / duration; // 0..1
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);

      // カメラ：手前へ進みながら回り込み、最後は正面
      const camT = easeIO(clamp((t - 0.25) / 0.6));
      const yaw = lerp(0.9, 0, camT);
      const pitch = lerp(0.35, 0, camT);
      const dist = lerp(9, 5.2, camT);

      // 1) データの粒が奥から流れ込む
      const speed = lerp(0.55, 0.05, clamp((t - 0.2) / 0.5));
      const fadeP = 1 - clamp((t - 0.55) / 0.25);
      for (const p of pts) {
        p.z -= speed * (0.6 + p.s);
        if (p.z < 0.4) { p.z = 40; p.x = (Math.random() - 0.5) * 14; p.y = (Math.random() - 0.5) * 9; }
        const q = proj(p.x, p.y, p.z, 0, 0, 0);
        if (!q) continue;
        const a = clamp(1 - p.z / 40) * 0.85 * fadeP;
        if (a <= 0.01) continue;
        const r = Math.max(0.4, 1.6 * q[2] / 90);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(q[0], q[1], r, r * (1 + speed * 6));
      }

      // 2) 3枚のフレームが飛来して並ぶ
      const fT = (i) => ease(clamp((t - 0.22 - i * 0.07) / 0.38));
      FRAMES.forEach((quad, i) => {
        const k = fT(i);
        if (k <= 0) return;
        const f = fly[i];
        const rz = f.rot * (1 - k);
        const cz = Math.cos(rz); const sz = Math.sin(rz);
        const depth = [-0.25, 0, 0.25][i];
        // 奥行きのある額縁：前面と背面の2枚＋つなぎの線
        const faces = [0, 0.18].map((th) => quad.map(([x, y]) => {
          const X = x * cz - y * sz; const Y = x * sz + y * cz;
          return proj(X + f.dx * (1 - k), Y + f.dy * (1 - k), depth + th + f.dz * (1 - k), yaw, pitch, dist);
        }));
        if (faces[0].some((q) => !q) || faces[1].some((q) => !q)) return;
        ctx.lineJoin = 'round';
        // 側面（うっすら）
        ctx.strokeStyle = `rgba(190,210,255,${0.35 * k})`;
        ctx.lineWidth = 1;
        for (let j = 0; j < 4; j += 1) { ctx.beginPath(); ctx.moveTo(faces[0][j][0], faces[0][j][1]); ctx.lineTo(faces[1][j][0], faces[1][j][1]); ctx.stroke(); }
        ctx.beginPath(); faces[1].forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.stroke();
        // 前面
        ctx.strokeStyle = `rgba(255,255,255,${k})`;
        ctx.lineWidth = Math.max(1.5, faces[0][0][2] * 0.055);
        ctx.fillStyle = `rgba(255,255,255,${0.06 * k})`;
        ctx.beginPath(); faces[0].forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
      });

      // 3) 光のリボンが3枚を通り抜ける（左から右へ描かれ、粒が先頭を走る）
      const wT = easeIO(clamp((t - 0.48) / 0.32));
      if (wT > 0) {
        const x0 = -2.1; const x1 = 2.1;
        const xe = lerp(x0, x1, wT);
        const seg = 90;
        ctx.lineCap = 'round';
        for (let pass = 0; pass < 2; pass += 1) {
          ctx.beginPath();
          let first = true;
          for (let s = 0; s <= seg; s += 1) {
            const x = lerp(x0, xe, s / seg);
            const z = 0.05 + Math.sin((x + t * 3) * 2.2) * 0.12 * (1 - camT);
            const q = proj(x, waveY(x), z, yaw, pitch, dist);
            if (!q) continue;
            if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]);
          }
          ctx.strokeStyle = pass ? '#ffffff' : 'rgba(255,255,255,.18)';
          ctx.lineWidth = pass ? Math.max(2, size.h * 0.007) : Math.max(8, size.h * 0.024);
          ctx.stroke();
        }
        const head = proj(xe, waveY(xe), 0.05, yaw, pitch, dist);
        if (head && wT < 1) {
          const g = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 26);
          g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head[0], head[1], 26, 0, TAU); ctx.fill();
        }
      }

      if (!logoFired && t > 0.82) { logoFired = true; if (onLogo) onLogo(); }
      if (t < 1) raf = requestAnimationFrame(frame);
      else { stop(); if (onDone) onDone(); }
    };
    raf = requestAnimationFrame(frame);
    function stop() { stopped = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onR); }
    return { stop };
  }

  /* ---------------------------------------------------------------------
     TERRAIN：流れる等高線（ヒーロー背景）
     --------------------------------------------------------------------- */
  function TBTerrain(canvas, { color = '255,255,255', lines = 46, paused = () => false } = {}) {
    const { ctx, resize } = setupCanvas(canvas);
    let size = resize();
    let proj = makeProjector(size.w, size.h, 1.0);
    let mx = 0; let my = 0; let tx = 0; let ty = 0;
    const onR = () => { size = resize(); proj = makeProjector(size.w, size.h, 1.0); };
    window.addEventListener('resize', onR);
    const onM = (e) => { tx = (e.clientX / window.innerWidth - 0.5); ty = (e.clientY / window.innerHeight - 0.5); };
    window.addEventListener('pointermove', onM, { passive: true });
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);
    let t0 = performance.now(); let time = 0; let raf;
    const height = (x, z, t) => (
      Math.sin(x * 0.55 + t * 0.35) * 0.55 +
      Math.sin(z * 0.42 - t * 0.28 + x * 0.2) * 0.65 +
      Math.sin((x + z) * 0.9 + t * 0.5) * 0.18
    );
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(50, now - t0); t0 = now;
      if (!visible) return;
      if (!paused()) time += dt / 1000;
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);
      const yaw = mx * 0.35; const pitch = 0.42 + my * 0.12;
      for (let i = 0; i < lines; i += 1) {
        const z = -6 + i * 0.42;
        ctx.beginPath();
        let first = true;
        for (let x = -11; x <= 11; x += 0.35) {
          const y = height(x, z, time) - 2.2;
          const q = proj(x, y, z, yaw, pitch, 9);
          if (!q) { first = true; continue; }
          if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]);
        }
        const a = 0.04 + 0.22 * (1 - i / lines);
        ctx.strokeStyle = `rgba(${color},${a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(draw);
    return { stop() { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', onR); window.removeEventListener('pointermove', onM); } };
  }

  /* ---------------------------------------------------------------------
     FRAMES：回転する立体ロゴ（スクロールで角度が変わる）
     --------------------------------------------------------------------- */
  function TBFrames(canvas, { color = '#ffffff', wave = '#ffffff', getSpin = () => 0, paused = () => false } = {}) {
    const { ctx, resize } = setupCanvas(canvas);
    let size = resize();
    let proj = makeProjector(size.w, size.h, 0.9);
    const onR = () => { size = resize(); proj = makeProjector(size.w, size.h, 0.9); };
    window.addEventListener('resize', onR);
    let tx = 0; let ty = 0; let mx = 0; let my = 0;
    const onM = (e) => { const r = canvas.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5); ty = ((e.clientY - r.top) / r.height - 0.5); };
    window.addEventListener('pointermove', onM, { passive: true });
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    let time = 0; let last = performance.now(); let raf;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(50, now - last); last = now;
      if (!visible) return;
      if (!paused()) time += dt / 1000;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      const { w, h } = size;
      ctx.clearRect(0, 0, w, h);
      const yaw = Math.sin(time * 0.4) * 0.55 + mx * 0.9 + getSpin();
      const pitch = 0.18 + Math.sin(time * 0.3) * 0.08 + my * 0.5;
      const dist = 6.2;
      // 背面から描く（各フレームの奥行きで並べ替え）
      const items = FRAMES.map((quad, i) => {
        const z = [-0.35, 0, 0.35][i] + Math.sin(time * 1.2 + i) * 0.05;
        const faces = [0, 0.22].map((th) => quad.map(([x, y]) => proj(x, y + Math.sin(time + i) * 0.04, z + th, yaw, pitch, dist)));
        const depth = faces[0].reduce((s, q) => s + (q ? q[3] : 0), 0);
        return { faces, depth };
      }).sort((a, b) => b.depth - a.depth);
      // リボン
      const ribbon = [];
      for (let s = 0; s <= 80; s += 1) {
        const x = -2.2 + 4.4 * s / 80;
        ribbon.push(proj(x, waveY(x), 0.1 + Math.sin(x * 2 + time * 2) * 0.06, yaw, pitch, dist));
      }
      items.forEach(({ faces }) => {
        if (faces.flat().some((q) => !q)) return;
        ctx.strokeStyle = color; ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
        for (let j = 0; j < 4; j += 1) { ctx.beginPath(); ctx.moveTo(faces[0][j][0], faces[0][j][1]); ctx.lineTo(faces[1][j][0], faces[1][j][1]); ctx.stroke(); }
        ctx.beginPath(); faces[1].forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = Math.max(2, faces[0][0][2] * 0.05);
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.beginPath(); faces[0].forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.lineCap = 'round';
      [[Math.max(10, h * 0.03), 'rgba(255,255,255,.14)'], [Math.max(3, h * 0.011), wave]].forEach(([lw, c]) => {
        ctx.beginPath(); let first = true;
        ribbon.forEach((q) => { if (!q) return; if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]); });
        ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke();
      });
      // リボンの上を走る光の粒
      const k = (time * 0.35) % 1;
      const q = ribbon[Math.floor(k * 80)];
      if (q) {
        const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 18);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q[0], q[1], 18, 0, TAU); ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return { stop() { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', onR); window.removeEventListener('pointermove', onM); } };
  }

  window.TB3D = { TBOpening, TBTerrain, TBFrames };
})();
