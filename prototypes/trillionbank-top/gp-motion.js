/* GP MOTION — goodpatch.com/ja のホバー／スクロールの動きを参考にした追加レイヤー
   main.js のあとに読み込みます。このファイルと gp-motion.css を外すと、元の動きに戻ります。 */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* =========================================================================
     ⑦ ボタンの文字：カーソルを当てると上へ入れ替わる
     ========================================================================= */
  $$('.pill').forEach((pill) => {
    if (pill.querySelector('.roll')) return;
    const nodes = Array.from(pill.childNodes).filter((n) => !(n.nodeType === 1 && n.tagName === 'SMALL'));
    if (!nodes.some((n) => n.textContent.trim())) return;
    const roll = document.createElement('span');
    roll.className = 'roll';
    const front = document.createElement('span');
    const back = document.createElement('span');
    back.setAttribute('aria-hidden', 'true');
    nodes.forEach((n) => front.appendChild(n));
    Array.from(front.childNodes).forEach((n) => back.appendChild(n.cloneNode(true)));
    roll.append(front, back);
    pill.insertBefore(roll, pill.firstChild);
  });

  /* =========================================================================
     ⑤ メガメニュー：Business にカーソル／キーボードのフォーカスで開く
     ========================================================================= */
  const header = $('#header');
  const megaLi = $('.has-mega');
  if (megaLi) {
    const trigger = $(':scope > a', megaLi);
    let closeTimer = 0;
    let suppressed = false;
    const setOpen = (on) => {
      clearTimeout(closeTimer);
      megaLi.classList.toggle('is-open', on);
      header.classList.toggle('is-mega', on);
    };
    megaLi.addEventListener('mouseenter', () => { if (!suppressed) setOpen(true); });
    megaLi.addEventListener('mouseleave', () => {
      suppressed = false;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => setOpen(false), 140);
    });
    megaLi.addEventListener('focusin', () => setOpen(true));
    megaLi.addEventListener('focusout', (e) => { if (!megaLi.contains(e.relatedTarget)) setOpen(false); });
    megaLi.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && megaLi.classList.contains('is-open')) {
        setOpen(false);
        suppressed = true;
        trigger.focus({ preventScroll: true });
      }
    });
    // 行き先を選んだら閉じる
    megaLi.addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      suppressed = true;
      setOpen(false);
      if (document.activeElement && megaLi.contains(document.activeElement)) document.activeElement.blur();
    });
    // スクロールし始めたら閉じる
    let openY = 0;
    megaLi.addEventListener('mouseenter', () => { openY = window.scrollY; });
    window.addEventListener('scroll', () => {
      if (megaLi.classList.contains('is-open') && Math.abs(window.scrollY - openY) > 60 && !megaLi.contains(document.activeElement)) setOpen(false);
    }, { passive: true });
  }

  if (reduce) return;

  /* =========================================================================
     ① 最初のスクロール：背景が中央の丸に集まり、白い背景に変わる
        PC：ヒーローを画面に固定したまま円に縮め、次のセクションのロゴの丸にぴったり重ねる。
            円の周りには、下から上がってきたステートメントの文章が並ぶ。
        スマホ・タブレット：スクロールに合わせて、ヒーローが中央の丸に縮みながら流れていく。
     ========================================================================= */
  const pin = $('#heroPin');
  const hero = $('#top');
  const copy = $('.hero__copy', hero);
  const statement = $('#statement');
  const core = $('#emblemCore');
  let pinned = false;
  let range = 1;
  const land = { x: 0, y: 0, r: 60 };
  const measureHero = () => {
    if (!pin) return;
    pinned = window.innerWidth >= 1000 && window.innerHeight >= 600;
    pin.classList.toggle('is-pinned', pinned);
    if (pinned) {
      range = Math.max(1, pin.offsetHeight - window.innerHeight);
      // 着地点：ステートメントの中のロゴの丸（ステートメントの上端から見た位置）
      const sr = statement.getBoundingClientRect();
      const cr = core.getBoundingClientRect();
      land.x = cr.left + cr.width / 2 - sr.left;
      land.y = cr.top + cr.height / 2 - sr.top;
      land.r = cr.width / 2;
      // 角が白くなり始めたら、ヘッダーを白地に切り替える
      hero.dataset.solidAt = String(Math.round(range * 0.05));
    } else {
      range = Math.max(1, hero.offsetHeight * 0.85);
      hero.dataset.solidAt = String(Math.round(hero.offsetHeight * 0.06));
    }
  };
  const updateHero = () => {
    if (!pin) return;
    const y = window.scrollY;
    if (y > range + window.innerHeight * 1.5) return; // 画面の外では計算しない
    const p = clamp(y / range, 0, 1);
    const e = easeInOut(p);
    const w = window.innerWidth;
    const h = pinned ? window.innerHeight : hero.offsetHeight;
    let cx = w / 2; let cy = h / 2; let rEnd = Math.min(w, h) * 0.2;
    if (pinned) { cx = lerp(w / 2, land.x, e); cy = lerp(h / 2, land.y, e); rEnd = land.r; }
    const r = lerp(Math.hypot(w, h) / 2 + 4, rEnd, e);
    hero.style.setProperty('--aperture', p > 0.002 ? `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)` : 'none');
    hero.style.setProperty('--shapes-s', (1 - e * 0.25).toFixed(3));
    // PCでは最後に、ヒーローの円がロゴの丸と入れ替わる
    const fade = pinned ? clamp((1 - p) / 0.1, 0, 1) : 1;
    hero.style.opacity = fade < 1 ? fade.toFixed(3) : '';
    hero.style.pointerEvents = pinned && p > 0.97 ? 'none' : '';
    const o = clamp(1 - p * (pinned ? 2.6 : 1.8), 0, 1);
    hero.style.setProperty('--copy-o', o.toFixed(3));
    hero.style.setProperty('--copy-y', `${(-p * (pinned ? 90 : 60)).toFixed(1)}px`);
    hero.style.setProperty('--copy-s', (1 - p * 0.12).toFixed(3));
    // 見えなくなったボタンは、押せない・フォーカスされないように
    copy.style.visibility = o < 0.04 ? 'hidden' : '';
  };

  /* =========================================================================
     ③ 色の濃いセクションの上端：山なりのカーブ。スクロールの速さで弾む
     ========================================================================= */
  const curves = $$('[data-curve]').map((el) => ({ el, w: 0, h: 0 }));
  let cap = 60;
  let bend = 0; // 速さで足されるたわみ
  let bendVel = 0;
  let lastY = window.scrollY;
  const setupCurves = () => {
    cap = Math.round(clamp(window.innerWidth * 0.055, 28, 88));
    curves.forEach((c) => {
      c.el.style.paddingTop = '';
      c.el.style.marginTop = '';
      const pt = parseFloat(getComputedStyle(c.el).paddingTop) || 0;
      c.el.style.paddingTop = `${pt + cap}px`;
      c.el.style.marginTop = `${-cap}px`;
      c.el.classList.add('is-curved');
      c.w = c.el.offsetWidth;
      c.h = c.el.offsetHeight;
    });
  };
  const drawCurve = (c) => {
    const amp = clamp(cap * 0.55 + bend, cap * 0.08, cap * 0.98);
    const ctrl = cap - amp * 2;
    c.el.style.setProperty('--curve', `path("M0 ${cap} Q ${(c.w / 2).toFixed(1)} ${ctrl.toFixed(1)} ${c.w} ${cap} L ${c.w} ${c.h} L 0 ${c.h} Z")`);
  };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((entries) => {
      entries.forEach((en) => {
        const c = curves.find((x) => x.el === en.target);
        if (!c) return;
        c.w = c.el.offsetWidth;
        c.h = c.el.offsetHeight;
        drawCurve(c);
      });
    });
    curves.forEach((c) => ro.observe(c.el));
  }

  /* =========================================================================
     ④ カードの視差：並んだカードが少しずつ違う速さで流れる
     ========================================================================= */
  const parGroups = [
    { items: $$('.media__list > li'), speeds: [-0.05, 0.04, 0.12, 0.0] },
    { items: $$('.ncards > li'), speeds: [0.0, 0.07, -0.03, 0.1] },
  ];
  parGroups.forEach((g) => g.items.forEach((li) => li.classList.add('gp-par')));
  const updateParallax = () => {
    const on = window.innerWidth >= 768;
    const mid = window.innerHeight / 2;
    parGroups.forEach((g) => g.items.forEach((li, i) => {
      if (!on) { li.style.removeProperty('--par'); return; }
      const r = li.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const d = (r.top + r.height / 2 - mid) * g.speeds[i % g.speeds.length];
      li.style.setProperty('--par', `${d.toFixed(1)}px`);
    }));
  };

  /* 大きな背景文字「In the Media」：スクロールで横へ流れる */
  const media = $('.media');
  const mediaBg = $('.media__bg');
  const updateMediaBg = () => {
    if (!media || !mediaBg) return;
    const r = media.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
    mediaBg.style.setProperty('--bgx', `${((0.5 - p) * window.innerWidth * 0.35).toFixed(1)}px`);
  };

  /* =========================================================================
     フレームごとの更新
     ========================================================================= */
  let rafId = 0;
  const frame = () => {
    rafId = 0;
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    // 速くスクロールするほどカーブが平らに。止まるとばねのように戻る
    const target = clamp(-dy * 0.9, -cap * 0.5, cap * 0.5);
    bendVel += (target - bend) * 0.16;
    bendVel *= 0.74;
    bend += bendVel;
    updateHero();
    updateParallax();
    updateMediaBg();
    const vh = window.innerHeight;
    curves.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      if (r.top < vh + 50 && r.top > -cap - 50) drawCurve(c);
    });
    if (Math.abs(bend) > 0.05 || Math.abs(bendVel) > 0.05 || dy !== 0) rafId = requestAnimationFrame(frame);
  };
  const kick = () => { if (!rafId) rafId = requestAnimationFrame(frame); };
  const onResize = () => {
    measureHero();
    setupCurves();
    curves.forEach(drawCurve);
    kick();
    window.dispatchEvent(new Event('scroll'));
  };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
  onResize();
})();
