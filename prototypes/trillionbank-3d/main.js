/* Trillion Bank — 3D版トップページ */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const narrow = () => window.innerWidth < 768;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sget = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const sset = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  let paused = false;
  const isPaused = () => paused;

  /* =========================================================================
     OPENING（3D）：数え上げ → データの粒が流れ込む → 3枚のフレームが飛来 →
     光のリボンが通り抜けロゴになる → 3枚の幕が開いて本編へ
     ========================================================================= */
  const opening = $('#opening');
  const mascot = $('#mascot');
  let done = false; let scene = null; const timers = [];
  const ready = () => {
    root.classList.add('is-ready');
    if (mascot && !reduce) { mascot.classList.add('is-greet'); setTimeout(() => mascot.classList.remove('is-greet'), 3200); }
  };
  const finish = (fast) => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    sset('tb3d-opened', '1');
    opening.classList.add('is-closing');
    setTimeout(() => {
      if (scene) scene.stop();
      opening.classList.add('is-leaving');
      document.body.style.overflow = '';
      ready();
      setTimeout(() => opening.classList.add('is-done'), 1100);
    }, fast ? 450 : 600);
  };
  if (!opening || reduce || sget('tb3d-opened') === '1') {
    if (opening) opening.classList.add('is-done');
    ready();
  } else {
    document.body.style.overflow = 'hidden';
    const num = $('#openingNum');
    let start = null;
    const tick = (now) => {
      if (done) return;
      if (start === null) start = now;
      const t = clamp((now - start) / 1100);
      num.textContent = Math.min(1e12, Math.floor(Math.pow(10, 12 * (1 - Math.pow(1 - t, 2))))).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick); else num.textContent = '1,000,000,000,000';
    };
    requestAnimationFrame(tick);
    timers.push(setTimeout(() => opening.classList.add('is-flying'), 1250));
    scene = window.TB3D.TBOpening($('#openingCanvas'), {
      duration: 3800,
      onLogo: () => opening.classList.add('is-logo'),
      onDone: () => timers.push(setTimeout(() => finish(false), 350)),
    });
    $('#openingSkip').addEventListener('click', () => finish(true));
    opening.addEventListener('click', () => finish(true));
    window.addEventListener('keydown', function k() { finish(true); window.removeEventListener('keydown', k); });
  }

  /* ---------- 3D：ヒーロー・ビジョン ---------- */
  if (!reduce && window.TB3D) {
    window.TB3D.TBTerrain($('#terrain'), { paused: isPaused });
    window.TB3D.TBFrames($('#logo3d'), { paused: isPaused, getSpin: () => window.scrollY * 0.0012 });
    window.TB3D.TBTerrain($('#visionCanvas'), { color: '120,150,255', lines: 40, paused: isPaused });
  }

  /* =========================================================================
     HEADER / DRAWER / MOTION
     ========================================================================= */
  const header = $('#header');
  const hero = $('#top');
  let lastY = window.scrollY;
  const updateHeader = () => {
    const y = window.scrollY;
    const end = hero.offsetHeight - header.offsetHeight;
    header.classList.toggle('is-solid', y > end);
    header.classList.toggle('is-hidden', y > lastY && y > end + 200 && !document.body.classList.contains('is-drawer-open'));
    lastY = y;
  };
  const menuBtn = $('#menuBtn'); const drawer = $('#drawer');
  const setDrawer = (open) => {
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('is-drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('a', drawer).focus();
  };
  menuBtn.addEventListener('click', () => setDrawer(drawer.hidden));
  $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { setDrawer(false); menuBtn.focus(); } });
  const motionBtn = $('#motionBtn');
  motionBtn.addEventListener('click', () => {
    paused = !paused;
    root.classList.toggle('is-motion-paused', paused);
    motionBtn.setAttribute('aria-pressed', String(paused));
    motionBtn.setAttribute('aria-label', paused ? '動きを再生する' : '動きを停止する');
    $('#motionLabel').textContent = paused ? '動き：OFF' : '動き：ON';
  });

  /* =========================================================================
     TEXT
     ========================================================================= */
  $$('.split').forEach((el) => {
    if (reduce) return;
    const text = el.textContent; el.textContent = ''; let i = 0;
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
      const w = document.createElement('span'); w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
      Array.from(part).forEach((ch) => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.transitionDelay = `${i * 30}ms`; i += 1; w.appendChild(c); });
      el.appendChild(w);
    });
    el.classList.add('split-ready');
  });

  // 数字のカウントアップ
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const fmt = (v) => (el.dataset.format === 'man' ? `${Math.round(v / 10000).toLocaleString('ja-JP')}万` : Math.round(v).toLocaleString('ja-JP'));
    if (reduce || target === 0) { el.textContent = fmt(target); return; }
    let s = null;
    const step = (now) => { if (s === null) s = now; const t = clamp((now - s) / 1600); el.textContent = fmt(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  // 「今日、何回検索しましたか。」を1語ずつ立ち上げる
  const lightWords = (el) => $$('.w', el).forEach((w, i) => setTimeout(() => w.classList.add('is-on'), reduce ? 0 : i * 180));

  const targets = $$('.rv, .rv3d, .split-ready, .founder__photo, [data-count], [data-words]');
  const onIn = (el) => {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
    if (el.hasAttribute('data-words')) lightWords(el);
  };
  if (reduce || !('IntersectionObserver' in window)) targets.forEach(onIn);
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { onIn(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* =========================================================================
     SCROLL SCENES
     ========================================================================= */
  const vh = () => window.innerHeight;
  const prog = (el) => { const r = el.getBoundingClientRect(); const total = el.offsetHeight - vh(); return total > 0 ? clamp(-r.top / total) : (r.top < 0 ? 1 : 0); };
  const pins = $$('.pin');
  const hs = $$('.hs');
  const setup = () => {
    pins.forEach((p) => {
      const n = Number(p.dataset.steps || 3);
      const stat = reduce || narrow();
      p.classList.toggle('is-static', stat);
      p.style.height = stat ? '' : `${(n + 1) * 65}vh`;
      if (stat) { $$('[data-on]', p).forEach((el) => el.classList.add('is-on')); p.style.setProperty('--op', 1); }
    });
    hs.forEach((s) => {
      const track = $('.hs__track', s);
      const nat = reduce || narrow();
      s.classList.toggle('is-native', nat);
      if (nat) { s.style.height = ''; return; }
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      s.dataset.dist = dist;
      s.style.height = `${dist + vh() * 1.15}px`;
    });
  };
  const fill = $('.fill'); const fillW = fill ? $$('.w', fill) : [];
  const stackScene = $('#stackScene');
  const coin = $('#coin');
  const drifts = $$('[data-drift]');
  const progress = $('#progress');
  const footer = $('.footer');

  const onScroll = () => {
    updateHeader();
    const y = window.scrollY;
    const H = document.documentElement.scrollHeight - vh();
    progress.style.setProperty('--sp', (H > 0 ? y / H : 0).toFixed(4));
    if (mascot) mascot.classList.toggle('is-away', footer.getBoundingClientRect().top < vh() * 0.85 || y < 40);
    if (reduce) return;
    pins.forEach((p) => {
      if (p.classList.contains('is-static')) return;
      const n = Number(p.dataset.steps || 3);
      const t = prog(p);
      const step = Math.min(n, Math.floor(t * n) + 1);
      $$('[data-on]', p).forEach((el) => el.classList.toggle('is-on', step >= Number(el.dataset.on)));
      p.style.setProperty('--op', clamp(t * 1.15).toFixed(3));
      if (stackScene && p.contains(stackScene)) stackScene.style.setProperty('--gap', `${14 + t * 80}px`);
    });
    hs.forEach((s) => {
      if (s.classList.contains('is-native')) return;
      const t = prog(s);
      s.style.setProperty('--hx', (t * Number(s.dataset.dist || 0)).toFixed(1));
      s.style.setProperty('--hp', t.toFixed(3));
    });
    if (fill) {
      const r = fill.getBoundingClientRect();
      const lit = r.bottom < vh() * 0.7 ? fillW.length : Math.round(clamp((vh() * 0.9 - r.top) / (r.height + vh() * 0.2)) * fillW.length);
      fillW.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    }
    if (coin) {
      const r = coin.getBoundingClientRect();
      const t = clamp((vh() * 0.85 - r.top) / (vh() * 0.7));
      coin.style.setProperty('--cr', (-25 + t * 50).toFixed(1));
      coin.style.setProperty('--cs', clamp((t - 0.35) / 0.45).toFixed(3));
    }
    drifts.forEach((el) => { const r = el.getBoundingClientRect(); el.style.setProperty('--drift', (((r.top + r.height / 2) - vh() / 2) / vh() * Number(el.dataset.drift)).toFixed(1)); });
  };
  let ticking = false;
  const frame = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); };
  window.addEventListener('scroll', frame, { passive: true });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { setup(); frame(); }, 150); });
  if (reduce && fill) fillW.forEach((w) => w.classList.add('is-on'));
  if (reduce && coin) { coin.style.setProperty('--cs', 1); }

  /* =========================================================================
     AirReach Tools 収支シミュレーター
     ========================================================================= */
  const d = $('#simD'); const pr = $('#simP');
  const yen = (v) => `${Math.round(v).toLocaleString('ja-JP')}円`;
  const sim = () => {
    const n = Number(d.value); const p = Number(pr.value);
    // 自社サイトの1ドメインは無料（代理店特典）。ここではお客様のドメイン分を試算
    const sales = n * p; const cost = n * 9800;
    $('#simDOut').textContent = n; $('#simPOut').textContent = yen(p);
    $('#simSales').textContent = yen(sales); $('#simCost').textContent = `−${yen(cost)}`; $('#simGP').textContent = yen(sales - cost);
  };
  d.addEventListener('input', sim); pr.addEventListener('input', sim); sim();

  /* =========================================================================
     POINTER：立体のhover・カーソル・吸い寄せ
     ========================================================================= */
  if (fine && !reduce) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; const yy = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
        el.style.setProperty('--rx', `${(0.5 - yy) * 12}deg`);
        el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${yy * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('is-tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const cur = $('#cursor'); const lab = $('#cursorLabel');
    let mx = -100; let my = -100; let cx = -100; let cy = -100;
    const darkSel = '.hero, .blue, .dark, .footer, .drawer, .scard';
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY; cur.classList.add('is-on');
      const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      cur.classList.toggle('is-hover', !!t); lab.textContent = t ? t.dataset.cursor : '';
      cur.classList.toggle('is-dark', !!(e.target.closest && e.target.closest(darkSel)));
    }, { passive: true });
    const loop = () => { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
  }

  setup(); onScroll();
  window.addEventListener('load', () => { setup(); frame(); });
})();
