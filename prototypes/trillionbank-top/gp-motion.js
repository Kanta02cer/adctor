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

/* =========================================================================
   ⑩〜⑫ 事業の入口（左右と円いレンズ）・Use Cases の一覧・トリウルの散歩
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wide = () => window.innerWidth >= 900;

  /* ---------- ⑩ 事業の入口 ---------- */
  const band = $('#business .bz-band--gray');
  const entry = $('#business .bz-entry');
  if (band && entry) {
    band.classList.add('bz-split');
    const flood = document.createElement('div');
    flood.className = 'bz-flood';
    flood.setAttribute('aria-hidden', 'true');
    band.insertBefore(flood, band.firstChild);
    const orb = document.createElement('div');
    orb.className = 'bz-orb';
    orb.setAttribute('aria-hidden', 'true');
    orb.innerHTML = '<svg viewBox="0 0 414 318"><use href="#tb-frames" class="f"/><use href="#tb-wave" class="w"/></svg>';
    const lens = document.createElement('div');
    lens.className = 'bz-lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.innerHTML = [
      '<svg class="la" viewBox="0 0 160 120"><path class="iso" d="M80 20 L140 50 L80 80 L20 50 Z"/><path class="iso" d="M20 50 L20 62 L80 92 L80 80 Z M140 50 L140 62 L80 92 L80 80 Z"/><path class="ln" d="M50 52 V38 M66 60 V34"/><path class="acc" d="M82 66 V26"/><circle class="ln" cx="104" cy="40" r="15"/><path class="ln" d="M115 51 L128 64"/></svg>',
      '<svg class="lb" viewBox="0 0 160 120"><path class="iso" d="M44 28 L64 18 L64 82 L44 92 Z M74 36 L94 26 L94 90 L74 100 Z M104 44 L124 34 L124 98 L104 108 Z"/><path class="acc" d="M10 62 H44 C54 62 56 52 66 52 C78 52 82 72 96 72 C106 72 108 64 116 64 H150"/><circle class="dot" cx="150" cy="64" r="5"/></svg>',
      '<span class="bz-lens__chip"></span>',
    ].join('');
    entry.append(orb, lens);
    const chip = $('.bz-lens__chip', lens);
    const cards = $$('.bz-card', entry);
    const labels = ['AirReach · 提供中', 'Adctor · 研究開発・限定実証'];

    let side = '';
    let lx = 0; let ly = 0; let tx = 0; let ty = 0; let raf = 0;
    const setFloodOrigin = (clientX, clientY) => {
      const r = band.getBoundingClientRect();
      band.style.setProperty('--fx', (clientX - r.left).toFixed(0) + 'px');
      band.style.setProperty('--fy', (clientY - r.top).toFixed(0) + 'px');
    };
    const setSide = (s, clientX, clientY) => {
      if (clientX !== undefined) setFloodOrigin(clientX, clientY);
      side = s;
      band.classList.toggle('is-flood', !!s);
      band.classList.toggle('is-side-a', s === 'a');
      band.classList.toggle('is-side-b', s === 'b');
      if (s) chip.textContent = labels[s === 'a' ? 0 : 1];
    };
    const follow = () => {
      raf = 0;
      lx += (tx - lx) * 0.16; ly += (ty - ly) * 0.16;
      lens.style.setProperty('--lx', lx.toFixed(1) + 'px');
      lens.style.setProperty('--ly', ly.toFixed(1) + 'px');
      if (Math.abs(tx - lx) + Math.abs(ty - ly) > 0.3) raf = requestAnimationFrame(follow);
    };
    const toLocal = (e) => { const r = entry.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

    if (fine && !reduce) {
      // レンズそのものがカーソルの役目をするので、カーソルの文字ラベルは出さない
      cards.forEach((card) => card.removeAttribute('data-cursor'));
      cards.forEach((card, i) => {
        const s = i === 0 ? 'a' : 'b';
        card.addEventListener('pointerenter', (e) => {
          if (!wide()) return;
          if (!band.classList.contains('is-lens')) {
            // レンズは中央の丸の位置から出てくる
            const er = entry.getBoundingClientRect(); const or = orb.getBoundingClientRect();
            lx = or.left + or.width / 2 - er.left; ly = or.top + or.height / 2 - er.top;
          }
          setSide(s, e.clientX, e.clientY);
          band.classList.add('is-lens');
          [tx, ty] = toLocal(e);
          if (!raf) raf = requestAnimationFrame(follow);
        });
        card.addEventListener('pointermove', (e) => {
          if (!side) return;
          [tx, ty] = toLocal(e);
          if (!raf) raf = requestAnimationFrame(follow);
        });
      });
      entry.addEventListener('pointerleave', (e) => {
        setFloodOrigin(e.clientX, e.clientY);
        setSide('');
        band.classList.remove('is-lens');
      });
    }
    // キーボードでも色が広がる（レンズは出さない）
    cards.forEach((card, i) => {
      card.addEventListener('focus', () => {
        if (!wide() || reduce) return;
        const r = card.getBoundingClientRect();
        setSide(i === 0 ? 'a' : 'b', r.left + r.width / 2, r.top + r.height / 2);
      });
      card.addEventListener('blur', () => { if (!band.classList.contains('is-lens')) setSide(''); });
    });
  }

  /* ---------- ⑪ Use Cases の一覧：図が円になってカーソルについてくる ---------- */
  const cardsWrap = $('#cards');
  if (cardsWrap && fine) {
    cardsWrap.classList.add('is-rows');
    $$('.card__link', cardsWrap).forEach((link) => {
      const img = $('.card__img', link);
      let cx = 0; let cy = 0; let tx = 0; let ty = 0; let raf = 0;
      const loop = () => {
        raf = 0;
        const k = reduce ? 1 : 0.2;
        cx += (tx - cx) * k; cy += (ty - cy) * k;
        img.style.setProperty('--cx', cx.toFixed(1) + 'px');
        img.style.setProperty('--cy', cy.toFixed(1) + 'px');
        if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(loop);
      };
      link.addEventListener('pointerenter', (e) => {
        const r = link.getBoundingClientRect();
        cx = tx = e.clientX - r.left; cy = ty = e.clientY - r.top;
        loop();
      });
      link.addEventListener('pointermove', (e) => {
        const r = link.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* ---------- ⑫ トリウルの散歩 ---------- */
  if (reduce) return;
  const latest = $('.latest');
  const track = $('.latest__track');
  const circle = $('#latestCircle');
  if (!latest || !track || !circle) return;
  track.classList.add('is-scroll');
  const walker = document.createElement('div');
  walker.className = 'walker';
  walker.setAttribute('aria-hidden', 'true');
  walker.innerHTML = [
    '<div class="walker__body">',
    '<span class="walker__balloon"><svg viewBox="0 0 60 110">',
    '<path class="s" d="M30 58 C26 72 36 82 30 96 C27 102 34 106 40 110"/>',
    '<path class="b" d="M30 0 C47 0 58 13 58 29 C58 45 44 56 30 58 C16 56 2 45 2 29 C2 13 13 0 30 0 Z"/>',
    '<path class="b" d="M26 57 L34 57 L32 62 L28 62 Z"/>',
    '<ellipse class="h" cx="18" cy="16" rx="6" ry="9" transform="rotate(-24 18 16)"/>',
    '<path class="m" d="M19 22 L27 18 L27 40 L19 44 Z M33 20 L41 16 L41 38 L33 42 Z"/>',
    '</svg></span>',
    '<img src="assets/toriuru-neutral.webp" alt="" width="480" height="480">',
    '</div>',
  ].join('');
  latest.appendChild(walker);
  latest.classList.add('has-walker');

  let lastX = null; let dist = 0; let face = 1; let sway = 0; let swayV = 0;
  const update = () => {
    const vh = window.innerHeight;
    const lr = latest.getBoundingClientRect();
    if (lr.bottom < -100 || lr.top > vh + 100) return;
    const W = latest.clientWidth;
    const wW = walker.offsetWidth; const wH = walker.offsetHeight;
    // スクロールに合わせて文字が横へ流れる
    const p = clamp((vh - lr.top) / (vh + lr.height * 0.4), 0, 1);
    track.style.setProperty('--mq', (-p * W * 0.45).toFixed(1) + 'px');
    // 歩く場所：文字の上端の少し上
    const tr = track.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(track.querySelector('span')).fontSize) || 120;
    const ground = tr.top - lr.top + fs * 0.2;
    const cr = circle.getBoundingClientRect();
    const rimX = cr.left - lr.left + cr.width * 0.16 - wW * 0.5;
    const rimY = cr.top - lr.top + cr.height * 0.12 - wH * 0.9;
    // 歩く区間 → 円のふちへぴょんと乗る
    const walkP = clamp((p - 0.12) / 0.5, 0, 1);
    const hopP = clamp((p - 0.62) / 0.12, 0, 1);
    const walkEndX = rimX - wW * 0.6;
    const groundY = ground - wH * 0.96;
    let x = -wW + (walkEndX + wW) * walkP;
    let y = groundY;
    if (hopP > 0) {
      x = walkEndX + (rimX - walkEndX) * hopP;
      y = groundY + (rimY - groundY) * hopP - Math.sin(hopP * Math.PI) * wH * 0.55;
    }
    // 歩いた距離に合わせて、上下にはずみ・左右に揺れる
    if (lastX !== null) {
      const dx = x - lastX;
      dist += Math.abs(dx);
      if (Math.abs(dx) > 0.5) face = dx >= 0 ? 1 : -1;
      swayV += (clamp(-dx * 0.9, -18, 18) - sway) * 0.2;
    }
    lastX = x;
    const walking = hopP === 0 && walkP > 0 && walkP < 1;
    const ph = dist * 0.055;
    const tilt = walking ? Math.sin(ph) * 5 : (hopP > 0 && hopP < 1 ? -10 * Math.sin(hopP * Math.PI) : 0);
    walker.style.setProperty('--wx', x.toFixed(1) + 'px');
    walker.style.setProperty('--wy', y.toFixed(1) + 'px');
    walker.style.setProperty('--hop', (walking ? -Math.abs(Math.sin(ph)) * 9 : 0).toFixed(1) + 'px');
    walker.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
    walker.style.setProperty('--face', String(face));
  };
  // 風船は少し遅れて揺れる
  let raf = 0;
  const balloon = () => {
    raf = 0;
    swayV *= 0.86; sway += swayV * 0.25; sway *= 0.96;
    walker.style.setProperty('--sway', sway.toFixed(2) + 'deg');
    if (Math.abs(sway) > 0.05 || Math.abs(swayV) > 0.05) raf = requestAnimationFrame(balloon);
  };
  const onScroll = () => { update(); if (!raf) raf = requestAnimationFrame(balloon); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* =========================================================================
   ⑬ 取締役・メンバー：スクロールで全員が立体的に横へ流れる
      PC：セクションを画面に固定し、縦のスクロールを横の動きに変える
      スマホ：横にスワイプ。どちらも、中央から離れたカードほど奥へ傾く
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.getElementById('members');
  if (!sec) return;
  const vp = sec.querySelector('.members__viewport');
  const track = sec.querySelector('.members__track');
  const bar = sec.querySelector('.members__progress');
  const items = Array.from(track.querySelectorAll('.mem'));
  if (!items.length) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let pinned = false;
  let dist = 0;

  const tilt = (viewLeft, viewWidth) => {
    if (reduce) return;
    const mid = viewLeft + viewWidth / 2;
    items.forEach((li) => {
      const r = li.getBoundingClientRect();
      const d = clamp((r.left + r.width / 2 - mid) / (viewWidth * 0.62), -1.4, 1.4);
      li.style.setProperty('--ry', `${(-d * 34).toFixed(2)}deg`);
      li.style.setProperty('--ms', (1 - Math.min(1, Math.abs(d)) * 0.12).toFixed(3));
    });
  };

  const measure = () => {
    pinned = !reduce && window.innerWidth >= 900 && window.innerHeight >= 640;
    sec.classList.toggle('is-pinned', pinned);
    sec.style.height = '';
    track.style.removeProperty('--tx');
    if (!pinned) return;
    // 横に流す距離：最後の人が右端の余白まで来るまで
    const gutter = parseFloat(getComputedStyle(vp).paddingLeft) || 0;
    dist = Math.max(0, track.scrollWidth - (vp.clientWidth - gutter * 2));
    sec.style.height = `${window.innerHeight + dist * 1.1}px`;
  };

  const update = () => {
    if (pinned) {
      const r = sec.getBoundingClientRect();
      const range = Math.max(1, sec.offsetHeight - window.innerHeight);
      const p = clamp(-r.top / range, 0, 1);
      track.style.setProperty('--tx', `${(-p * dist).toFixed(1)}px`);
      bar.style.setProperty('--mp', p.toFixed(4));
      if (r.bottom > 0 && r.top < window.innerHeight) tilt(0, window.innerWidth);
    } else {
      const vr = vp.getBoundingClientRect();
      if (vr.bottom > 0 && vr.top < window.innerHeight) tilt(vr.left, vr.width);
    }
  };

  // キーボードで画面の外のカードに移ったら、そのカードが見える位置までスクロールする
  items.forEach((li, i) => {
    li.addEventListener('focusin', () => {
      if (!pinned) return;
      const range = Math.max(1, sec.offsetHeight - window.innerHeight);
      const target = items.length > 1 ? i / (items.length - 1) : 0;
      const top = sec.getBoundingClientRect().top + window.scrollY + range * target;
      window.scrollTo({ top, behavior: 'instant' });
      vp.scrollLeft = 0;
    });
  });

  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener('scroll', kick, { passive: true });
  vp.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => { measure(); kick(); });
  window.addEventListener('load', () => { measure(); kick(); });
  measure();
  update();
})();
