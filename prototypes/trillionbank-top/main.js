/* Trillion Bank — トップページ（HTMLプロトタイプ） */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Opening ----------
     青い全面にロゴのフレームが現れ、白い線が通り抜け、ロゴタイプが出たあと波紋が広がって
     ヒーローへつながる（約2秒）。2回目以降の表示・動きを減らす設定・スキップでは省略。 */
  const opening = document.getElementById('opening');
  const mascot = document.getElementById('mascot');
  let opened = false;
  const finishOpening = () => {
    if (opened) return;
    opened = true;
    opening.classList.add('is-done');
    document.body.style.overflow = '';
    root.classList.add('is-ready');
    try { sessionStorage.setItem('tb-opened', '1'); } catch (e) { /* ignore */ }
    if (mascot) {
      mascot.classList.add('is-greeting');
      setTimeout(() => mascot.classList.remove('is-greeting'), 3200);
    }
  };
  let seen = false;
  try { seen = sessionStorage.getItem('tb-opened') === '1'; } catch (e) { /* ignore */ }
  if (reduce || seen || !opening) {
    finishOpening();
  } else {
    document.body.style.overflow = 'hidden';
    // ロゴのフレームを1枚ずつ線で描く
    requestAnimationFrame(() => opening.classList.add('is-playing'));
    const frames = opening.querySelectorAll('.opening__frames path');
    frames.forEach((p, i) => {
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 700, delay: 80 + i * 120, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards',
      });
    });
    setTimeout(finishOpening, 2100);
    document.getElementById('openingSkip').addEventListener('click', finishOpening);
    window.addEventListener('keydown', finishOpening, { once: true });
  }

  /* ---------- Header: ヒーローを過ぎたら白い面、下へスクロールで隠れ上へで出る ---------- */
  const header = document.getElementById('header');
  const hero = document.getElementById('top');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const heroBottom = hero.offsetHeight - header.offsetHeight;
    header.classList.toggle('is-solid', y > heroBottom);
    const down = y > lastY;
    header.classList.toggle('is-hidden', down && y > heroBottom + 120 && !document.body.classList.contains('is-drawer-open'));
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Drawer (mobile menu) ---------- */
  const menuBtn = document.getElementById('menuButton');
  const drawer = document.getElementById('drawer');
  const setDrawer = (open) => {
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('is-drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });

  /* ---------- Motion toggle ---------- */
  const motionBtn = document.getElementById('motionToggle');
  motionBtn.addEventListener('click', () => {
    const paused = root.classList.toggle('is-motion-paused');
    motionBtn.setAttribute('aria-pressed', String(paused));
    motionBtn.querySelector('.sr').textContent = paused ? 'を再開' : 'を停止';
  });

  /* ---------- Split text（英字の大見出しを1文字ずつ） ---------- */
  document.querySelectorAll('.split').forEach((el) => {
    if (reduce) return;
    const text = el.textContent;
    el.textContent = '';
    let i = 0;
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
      const word = document.createElement('span');
      word.style.display = 'inline-block';
      word.style.whiteSpace = 'nowrap';
      Array.from(part).forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        c.style.transitionDelay = `${i++ * 30}ms`;
        word.appendChild(c);
      });
      el.appendChild(word);
    });
    el.classList.add('split-ready');
  });

  /* ---------- Reveal on scroll ---------- */
  const targets = document.querySelectorAll('.reveal, .split-ready');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Statement：スクロールに合わせて言葉に色がつく ---------- */
  const fill = document.querySelector('[data-fill]');
  const words = fill ? Array.from(fill.querySelectorAll('.w')) : [];
  const updateFill = () => {
    if (!fill) return;
    const r = fill.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = reduce ? words.length : Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
  };

  /* ---------- Latest Activities：円がスクロールに合わせて少し大きくなる ---------- */
  const latest = document.querySelector('.latest__marquee');
  const updateCircle = () => {
    if (!latest || reduce) return;
    const r = latest.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    latest.style.setProperty('--circle', (0.6 + p * 1.6).toFixed(3));
  };

  /* ---------- Mascot：フッター付近では隠す ---------- */
  const footer = document.querySelector('.footer');
  const updateMascot = () => {
    if (!mascot || !footer) return;
    mascot.classList.toggle('is-away', footer.getBoundingClientRect().top < window.innerHeight * 0.8);
  };

  let ticking = false;
  const onFrame = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateFill(); updateCircle(); updateMascot(); ticking = false; });
  };
  window.addEventListener('scroll', onFrame, { passive: true });
  window.addEventListener('resize', onFrame);
  onFrame();

  /* ---------- Use cases filter ---------- */
  const filterBtns = document.querySelectorAll('.filter button');
  const cards = document.querySelectorAll('#cards .card');
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    filterBtns.forEach((x) => {
      const on = x === b;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', String(on));
    });
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.cat === f;
      c.hidden = !show;
      if (show) c.classList.add('is-in');
    });
  }));
})();
