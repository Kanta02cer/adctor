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
   ⑩〜⑪ 事業の入口（左右と円いレンズ）・Use Cases の一覧
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
    ].join('');
    entry.append(orb, lens);
    const cards = $$('.bz-card', entry);

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

})();

/* =========================================================================
   ⑬ 取締役・メンバー：スクロールすると全員が横へ流れ、真ん中に来た人が順に
      「当てた状態」（白いカード → 自己紹介）になる。PCもスマホも同じ動き
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.getElementById('members');
  if (!sec) return;
  const vp = sec.querySelector('.members__viewport');
  const track = sec.querySelector('.members__track');
  const bar = sec.querySelector('.members__progress');
  const items = Array.from(track.querySelectorAll('.mem'));
  const n = items.length;
  if (!n) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  let pinned = false;
  let txs = [];

  const measure = () => {
    pinned = !reduce && window.innerHeight >= 560;
    sec.classList.toggle('is-pinned', pinned);
    sec.style.height = '';
    track.style.setProperty('--tx', '0px');
    items.forEach((li) => { li.classList.remove('is-active', 'is-bio'); li.style.removeProperty('--ry'); li.style.removeProperty('--ms'); });
    if (!pinned) return;
    // 1人ずつ画面の真ん中に来る位置（横の移動量）を求める
    const t0 = track.getBoundingClientRect().left;
    const mid = window.innerWidth / 2;
    txs = items.map((li) => { const r = li.getBoundingClientRect(); return mid - (r.left - t0 + r.width / 2) - t0; });
    sec.style.height = `${Math.round(window.innerHeight + n * window.innerHeight * 0.7)}px`;
  };

  const tilt = () => {
    if (reduce) return;
    const mid = window.innerWidth / 2;
    items.forEach((li) => {
      const r = li.getBoundingClientRect();
      const d = clamp((r.left + r.width / 2 - mid) / (window.innerWidth * 0.5), -1.6, 1.6);
      li.style.setProperty('--ry', `${(-d * 30).toFixed(2)}deg`);
      li.style.setProperty('--ms', (1 - Math.min(1, Math.abs(d)) * 0.14).toFixed(3));
    });
  };

  const update = () => {
    if (!pinned) { tilt(); return; }
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const range = Math.max(1, sec.offsetHeight - window.innerHeight);
    const p = clamp(-r.top / range, 0, 1);
    // 1人あたりの区間：前半は止まって紹介（自己紹介を表示）、後半で次の人へ移る
    const f = Math.min(n - 0.0001, p * n);
    const i0 = Math.floor(f);
    const local = f - i0;
    const e = i0 < n - 1 ? smooth(clamp((local - 0.66) / 0.34, 0, 1)) : 0;
    const tx = txs[i0] + ((txs[i0 + 1] ?? txs[i0]) - txs[i0]) * e;
    track.style.setProperty('--tx', `${tx.toFixed(1)}px`);
    bar.style.setProperty('--mp', p.toFixed(4));
    const active = e < 0.5 ? i0 : i0 + 1;
    const bioOn = e === 0 && local > 0.28; // まず顔、そのあと自己紹介
    items.forEach((li, i) => {
      li.classList.toggle('is-active', i === active);
      li.classList.toggle('is-bio', i === active && bioOn);
    });
    tilt();
  };

  // キーボードでカードに移ったら、その人を紹介する位置までスクロールする
  items.forEach((li, i) => {
    li.addEventListener('focusin', () => {
      if (!pinned) return;
      const range = Math.max(1, sec.offsetHeight - window.innerHeight);
      const top = sec.getBoundingClientRect().top + window.scrollY + range * ((i + 0.4) / n);
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

/* =========================================================================
   ⑭ サービスのモデル：スクロールに合わせて手順と画面が切り替わる。
      端末は3Dで置き、近づくとノートパソコンのフタが開き、進むにつれて正面を向く。
      カーソルを動かすと、端末が少しだけ傾く
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const scenes = Array.from(document.querySelectorAll('[data-scene]')).map((el) => ({
    el, steps: Array.from(el.querySelectorAll('.dscene__step')), stage: el.querySelector('.stage3d'),
    pinned: false, px: 0, py: 0, tx: 0, ty: 0, raf: 0,
  }));
  if (!scenes.length) return;
  const set = (sc, k) => {
    if (sc.el.dataset.step === String(k)) return;
    sc.el.dataset.step = String(k);
    sc.steps.forEach((s, i) => s.classList.toggle('is-active', i === k));
  };
  const pose = (sc) => {
    const r = sc.el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (reduce) { sc.el.style.setProperty('--open', '1'); return; }
    // 画面の下から入ってくる間にフタが開く
    const open = smooth(clamp((vh - r.top) / (vh * 0.85), 0, 1));
    const range = Math.max(1, sc.el.offsetHeight - vh);
    const p = sc.pinned ? clamp(-r.top / range, 0, 1) : 0.5;
    const ry = -15 + 10 * p + sc.px * 5;
    const rx = -10 + 3 * p - sc.py * 4;
    sc.el.style.setProperty('--open', open.toFixed(3));
    sc.el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    sc.el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    sc.el.style.setProperty('--gl', (ry * 2.4).toFixed(1));
  };
  const measure = () => scenes.forEach((sc) => {
    sc.pinned = !reduce && window.innerHeight >= 560;
    sc.el.classList.toggle('is-pinned', sc.pinned);
  });
  const update = () => scenes.forEach((sc) => {
    const r = sc.el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    pose(sc);
    if (!sc.pinned) return;
    const range = Math.max(1, sc.el.offsetHeight - window.innerHeight);
    const p = clamp(-r.top / range, 0, 0.9999);
    set(sc, Math.min(sc.steps.length - 1, Math.floor(p * sc.steps.length)));
  });
  // カーソルに合わせて、端末をほんの少し傾ける（なめらかに追いかける）
  if (fine && !reduce) {
    scenes.forEach((sc) => {
      if (!sc.stage) return;
      const loop = () => {
        sc.raf = 0;
        sc.px += (sc.tx - sc.px) * 0.1;
        sc.py += (sc.ty - sc.py) * 0.1;
        pose(sc);
        if (Math.abs(sc.tx - sc.px) + Math.abs(sc.ty - sc.py) > 0.002) sc.raf = requestAnimationFrame(loop);
      };
      sc.stage.addEventListener('pointermove', (e) => {
        const b = sc.stage.getBoundingClientRect();
        sc.tx = clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1);
        sc.ty = clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1);
        if (!sc.raf) sc.raf = requestAnimationFrame(loop);
      });
      sc.stage.addEventListener('pointerleave', () => { sc.tx = 0; sc.ty = 0; if (!sc.raf) sc.raf = requestAnimationFrame(loop); });
    });
  }
  // 動きを減らす設定のときは、手順を押すと画面が切り替わる
  scenes.forEach((sc) => sc.steps.forEach((s, i) => s.addEventListener('click', () => { if (!sc.pinned) set(sc, i); })));
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => { measure(); kick(); });
  measure();
  update();
})();

/* =========================================================================
   ⑱ Use Cases：カードが画面上部に止まり、次のカードが手前に重なる。
      重なられたカードは少し縮んで暗くなる。カードが見えると右の図が動き出す
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wrap = document.querySelector('.ucx');
  if (!wrap) return;
  const items = Array.from(wrap.querySelectorAll('.uc'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); }
    }), { threshold: 0.35 });
    items.forEach((li) => io.observe(li));
  } else {
    items.forEach((li) => li.classList.add('is-on'));
  }
  // 立場のボタン：カーソルが入った位置から青が広がる
  wrap.querySelectorAll('.ucx__index a').forEach((a) => a.addEventListener('pointerenter', (e) => {
    const r = a.getBoundingClientRect();
    a.style.setProperty('--hx', `${e.clientX - r.left}px`);
    a.style.setProperty('--hy', `${e.clientY - r.top}px`);
  }));
  if (reduce) return;
  wrap.classList.add('is-stack');
  // カーソルに合わせて、右の図が少し傾く
  if (fine) {
    items.forEach((li) => {
      const card = li.querySelector('.uc__card');
      const v = li.querySelector('.uc__visual');
      card.addEventListener('pointermove', (e) => {
        const r = v.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width - 0.5, -0.8, 0.8);
        const y = clamp((e.clientY - r.top) / r.height - 0.5, -0.8, 0.8);
        v.style.setProperty('--vy', `${(x * 12).toFixed(2)}deg`);
        v.style.setProperty('--vx', `${(-y * 9).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => { v.style.setProperty('--vy', '0deg'); v.style.setProperty('--vx', '0deg'); });
    });
  }
  const update = () => {
    const stack = getComputedStyle(items[0]).position === 'sticky';
    items.forEach((li, i) => {
      const next = items[i + 1];
      let k = 0;
      if (stack && next) {
        const a = li.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        k = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      }
      li.style.setProperty('--k', k.toFixed(3));
    });
  };
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  update();
})();

/* =========================================================================
   ㉒ モーショングラフィックの視差・傾き、流れる大きな文字、モジュールの入り方
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mgs = Array.from(document.querySelectorAll('.mg'));
  const rows = Array.from(document.querySelectorAll('.kin__row'));

  // 動きを減らす設定では、SVGの中の動き（パケット）も止める
  if (reduce) {
    document.querySelectorAll('.mg svg').forEach((s) => { if (s.pauseAnimations) s.pauseAnimations(); });
    return;
  }

  // モジュールの入り方：同じ並びの中で少しずつ遅らせる
  const mods = Array.from(document.querySelectorAll('.bz-ways li, .more2, .bubble, .ucx__index a, .mcards > li, .kin'))
    .filter((el) => !el.closest('.reveal') && !el.classList.contains('reveal'));
  if ('IntersectionObserver' in window) {
    mods.forEach((el) => {
      const sibs = Array.from(el.parentElement.children);
      el.style.setProperty('--md', `${Math.min(sibs.indexOf(el), 5) * 0.09}s`);
      el.classList.add('mod');
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    mods.forEach((el) => io.observe(el));
  }

  // スクロール：図の視差と、大きな文字の流れ（速く動かすと少し傾く）
  let lastY = window.scrollY; let vel = 0; let raf = 0;
  const widths = new Map();
  const measure = () => rows.forEach((r) => {
    const t = r.querySelector('.kin__track');
    widths.set(r, t.scrollWidth / 3);
  });
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    const y = window.scrollY;
    vel = vel * 0.8 + (y - lastY) * 0.2;
    lastY = y;
    mgs.forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const d = (r.top + r.height / 2 - vh / 2) / vh;
      m.style.setProperty('--py', `${(d * -48).toFixed(1)}px`);
    });
    rows.forEach((row) => {
      const r = row.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const w = widths.get(row) || 1;
      const dir = Number(row.dataset.dir || 1);
      let x = ((y * 0.45) % w);
      x = dir > 0 ? -x : x - w;
      const t = row.querySelector('.kin__track');
      t.style.setProperty('--kx', `${x.toFixed(1)}px`);
      t.style.setProperty('--ks', `${clamp(-vel * 0.12, -8, 8).toFixed(2)}deg`);
    });
    if (Math.abs(vel) > 0.3) raf = requestAnimationFrame(update);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => { measure(); kick(); });
  window.addEventListener('load', () => { measure(); kick(); });
  measure();
  update();

  // カーソル：近くの図が、カーソルの方へ少し傾く
  if (fine) {
    window.addEventListener('pointermove', (e) => {
      mgs.forEach((m) => {
        if (m.classList.contains('mg--ad')) return;
        const r = m.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const x = clamp((e.clientX - (r.left + r.width / 2)) / window.innerWidth, -0.5, 0.5);
        const yy = clamp((e.clientY - (r.top + r.height / 2)) / window.innerHeight, -0.5, 0.5);
        m.style.setProperty('--my', `${(x * 18).toFixed(2)}deg`);
        m.style.setProperty('--mx', `${(-yy * 14).toFixed(2)}deg`);
      });
    }, { passive: true });
  }
})();
