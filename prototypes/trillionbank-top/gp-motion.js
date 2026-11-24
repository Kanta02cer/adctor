/* GP MOTION — goodpatch.com/ja のホバー／スクロールの動きを参考にした追加レイヤー
   main.js のあとに読み込みます。このファイルと gp-motion.css を外すと、元の動きに戻ります。 */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => (el ? el.querySelector(s) : null);
  const $$ = (s, el = document) => (el ? Array.from(el.querySelectorAll(s)) : []);
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
  const $ = (s, el = document) => (el ? el.querySelector(s) : null);
  const $$ = (s, el = document) => (el ? Array.from(el.querySelectorAll(s)) : []);
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
    // ガラスの玉の中に入口のカードの写しを置き、少し拡大して見せる（裏のページが透けて大きく見える）
    const ulSrc = $('ul', entry);
    const mag = document.createElement('div');
    mag.className = 'bz-mag';
    const copy = ulSrc.cloneNode(true);
    copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    copy.querySelectorAll('a').forEach((a) => { a.removeAttribute('href'); a.setAttribute('tabindex', '-1'); a.removeAttribute('data-cursor'); });
    mag.appendChild(copy);
    const rim = document.createElement('span');
    rim.className = 'bz-lens__rim';
    lens.prepend(mag);
    lens.append(rim);
    const MAG = 1.3;
    const place = () => {
      const L = lens.offsetWidth;
      mag.style.width = `${ulSrc.offsetWidth}px`;
      const x = L / 2 - (lx - ulSrc.offsetLeft) * MAG;
      const y = L / 2 - (ly - ulSrc.offsetTop) * MAG;
      mag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${MAG})`;
    };
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
      place();
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
   ⑬ 経営メンバー：一覧のカードを押すと、プロフィールの画面が開く（前・次で切り替え）
   ========================================================================= */
(() => {
  const sec = document.getElementById('members');
  const dlg = document.getElementById('leadDlg');
  if (!sec || !dlg || typeof dlg.showModal !== 'function') return;
  sec.classList.add('has-dialog');
  const cards = Array.from(sec.querySelectorAll('.lead__card'));
  const n = cards.length;
  const q = (s) => dlg.querySelector(s);
  let cur = 0;
  const pad = (v) => String(v).padStart(2, '0');
  const fill = (i, dir) => {
    cur = (i + n) % n;
    const c = cards[cur];
    const box = q('.lead-dlg__in');
    box.classList.remove('is-in', 'from-l', 'from-r');
    void box.offsetWidth;
    box.classList.add('is-in', dir < 0 ? 'from-l' : 'from-r');
    q('.lead-dlg__photo').innerHTML = c.querySelector('.lead__photo').innerHTML;
    q('.lead-dlg__photo').className = 'lead-dlg__photo' + (c.querySelector('.lead__photo--none') ? ' lead__photo--none' : '');
    const img = q('.lead-dlg__photo img');
    if (img) img.loading = 'eager';
    q('.lead-dlg__en').textContent = c.querySelector('.lead__en').textContent;
    q('.lead-dlg__name').textContent = c.querySelector('.lead__name').textContent;
    q('.lead-dlg__role').textContent = c.querySelector('.lead__role').textContent;
    q('.lead-dlg__bio').innerHTML = c.querySelector('.lead__bio').innerHTML;
    q('.lead-dlg__count').innerHTML = `<b>${pad(cur + 1)}</b> / ${pad(n)}`;
  };
  const open = (i) => {
    fill(i, 1);
    dlg.showModal();
    document.documentElement.classList.add('is-dlg-open');
  };
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('is-dlg-open');
    const b = cards[cur] && cards[cur].querySelector('.lead__open');
    if (b) b.focus();
  });
  cards.forEach((c, i) => c.querySelector('.lead__open').addEventListener('click', () => open(i)));
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
    const s = e.target.closest('[data-step]');
    if (s) fill(cur + Number(s.dataset.step), Number(s.dataset.step));
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') fill(cur + 1, 1);
    if (e.key === 'ArrowLeft') fill(cur - 1, -1);
  });
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
  const mods = Array.from(document.querySelectorAll('.bz-ways li, .more2, .bubble, .ucx__index a, .mcards > li, .kin, .cofacts > div'))
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

/* =========================================================================
   ㉓ Use Cases の山札：先頭のカードが順に奥へ回る（見えている間だけ）
   ========================================================================= */
(() => {
  const deck = document.querySelector('.ucdeck');
  if (!deck) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const co = document.querySelector('.co3 svg');
  if (reduce) { if (co && co.pauseAnimations) co.pauseAnimations(); return; }
  const cards = Array.from(deck.querySelectorAll('.ucdeck__card'));
  let order = cards.map((_, i) => i);
  let timer = 0;
  const step = () => {
    const front = cards[order[0]];
    front.classList.add('is-out');
    setTimeout(() => {
      order = order.slice(1).concat(order[0]);
      order.forEach((ci, pos) => cards[ci].style.setProperty('--p', String(pos)));
      front.classList.remove('is-out');
    }, 420);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !timer) timer = setInterval(step, 2600);
    if (!e.isIntersecting && timer) { clearInterval(timer); timer = 0; }
  }));
  io.observe(deck);
})();

/* =========================================================================
   ㉕ スクロールで文字に色が付いていく
      大きな見出しは、画面に入ってくるにつれて1文字ずつ色が付く。
      サービスのモデルの手順は、スクロールの進みに合わせて今の手順に色が付いていく
   ========================================================================= */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // 文字を1つずつ <t-c> で包む（既に1文字ずつ分かれている見出しは、その文字を使う）
  const split = (el) => {
    if (el._tc) return el._tc;
    let units = Array.from(el.querySelectorAll('.char'));
    if (units.length) {
      units.forEach((u) => u.classList.add('tc'));
    } else {
      if (/^H[1-6]$/.test(el.tagName) && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const walk = (node) => {
        Array.from(node.childNodes).forEach((c) => {
          if (c.nodeType === 3) {
            if (!c.textContent.trim()) return;
            const frag = document.createDocumentFragment();
            for (const ch of c.textContent) {
              if (/\s/.test(ch)) { frag.append(ch); continue; }
              const s = document.createElement('t-c');
              s.textContent = ch;
              frag.append(s);
              units.push(s);
            }
            c.replaceWith(frag);
          } else if (c.nodeType === 1 && !c.classList.contains('sr')) {
            walk(c);
          }
        });
      };
      walk(el);
    }
    el._tc = units;
    return units;
  };
  const paint = (units, f) => {
    const k = Math.ceil(Math.min(1, f / 0.85) * units.length);
    units.forEach((u, i) => u.classList.toggle('on', i < k));
  };

  const heads = Array.from(document.querySelectorAll('.phero__en, .phero__title, .sec-h__ja, .values__list b, .values__list li > span:last-child, .git__en, .flow4__t, .pair__copy, .band-link__en, .bz-en, .bz-ja, .bz-svc-title, .obiz__en, .obiz__ja, .obiz__big, .obiz__lead, .cov__text, .cov__lead, .members__en, .company__title, .big-title, .contact__title, .media__title'))
    .filter((el) => !el.closest('[data-fill]'));
  heads.forEach(split);
  const scenes = Array.from(document.querySelectorAll('.dscene')).map((sc) => ({
    el: sc,
    steps: Array.from(sc.querySelectorAll('.dscene__step')).map((li) => split(li.querySelector('.dscene__en')).concat(split(li.querySelector('strong')))),
  }));

  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    heads.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > vh * 1.2 || r.bottom < -vh * 0.2) return;
      paint(el._tc, clamp((vh * 0.92 - r.top) / (vh * 0.42 + r.height * 0.5), 0, 1));
    });
    scenes.forEach((sc) => {
      const r = sc.el.getBoundingClientRect();
      if (r.top > vh * 1.2 || r.bottom < -vh * 0.2) return;
      const n = sc.steps.length;
      if (!sc.el.classList.contains('is-pinned')) { sc.steps.forEach((u) => paint(u, 1)); return; }
      const range = Math.max(1, sc.el.offsetHeight - vh);
      const f = clamp(-r.top / range, 0, 0.9999) * n;
      // 手順ごとの区間の前半で、その手順の文字に色が付ききる
      sc.steps.forEach((u, i) => paint(u, clamp((f - i) / 0.55, 0, 1)));
    });
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  update();
})();

/* ページ内の場所（#adctor など）へ直接来たとき、文字の準備などで着地が遅れないよう、すぐにその場所へ */
(() => {
  const h = location.hash;
  if (h.length < 2) return;
  let t = null;
  try { t = document.getElementById(decodeURIComponent(h.slice(1))); } catch (e) { t = null; }
  if (!t) return;
  const go = () => t.scrollIntoView({ block: 'start', behavior: 'instant' });
  requestAnimationFrame(go);
  window.addEventListener('load', () => requestAnimationFrame(go), { once: true });
})();

/* =========================================================================
   ㉘ AirReach の図の流れ（見えている間だけ動く）
   ========================================================================= */
(() => {
  const el = document.querySelector('.arx');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tiles = Array.from(el.querySelectorAll('.arx__q li'));
  const num = el.querySelector('.arx__n');
  const round = el.querySelector('.arx__round');
  const chip = el.querySelector('.arx__chip');
  const steps = Array.from(el.querySelectorAll('.arx__steps span'));
  const ais = Array.from(el.querySelectorAll('.arx__ais span'));
  // 例：1回目は10問中3問、直したあとの2回目は10問中7問で名前が出た
  const R1 = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0];
  const R2 = [1, 1, 0, 1, 1, 0, 1, 1, 0, 1];
  const setStep = (k) => steps.forEach((s, i) => s.classList.toggle('on', i === k));
  const say = (t) => { chip.textContent = t; chip.classList.add('on'); };
  const quiet = () => chip.classList.remove('on');
  const paint = (R) => { tiles.forEach((t, i) => { t.className = R[i] ? 'is-hit' : 'is-miss'; }); num.textContent = String(R.reduce((a, b) => a + b, 0)); };
  if (reduce) { paint(R2); round.textContent = '2回目'; return; }
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const run = () => {
    stop();
    let t = 0;
    const measure = (R, label) => {
      at(t, () => { tiles.forEach((x) => { x.className = ''; }); quiet(); setStep(0); round.textContent = label; num.textContent = '0'; });
      t += 400;
      let hits = 0;
      R.forEach((r, i) => {
        hits += r;
        const h = hits;
        at(t, () => { tiles[i].className = 'is-ask'; ais.forEach((a, j) => a.classList.toggle('on', j === i % ais.length)); });
        at(t + 280, () => { tiles[i].className = r ? 'is-hit' : 'is-miss'; num.textContent = String(h); });
        t += 330;
      });
      at(t, () => ais.forEach((a) => a.classList.remove('on')));
    };
    measure(R1, '1回目');
    t += 900;
    at(t, () => { setStep(1); tiles.forEach((x, i) => { if (!R1[i]) x.classList.add('is-gap'); }); say('足りない情報：料金の目安・対応エリア'); });
    t += 2200;
    at(t, () => { setStep(2); say('下書き：会社の名札・よくある質問'); });
    t += 2200;
    at(t, () => { setStep(3); say('2週間後、同じ質問でもう一度'); });
    t += 2000;
    measure(R2, '2回目');
    t += 700;
    at(t, () => { setStep(4); say('レポートを出力（PDF・HTML）'); });
    t += 3000;
    at(t, run);
  };
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { if (!timers.length) run(); } else stop();
  }), { threshold: 0.2 }).observe(el);
})();

/* =========================================================================
   ㉙ Adctor の図：記録の件数が、情報が届くたびに増える（見えている間だけ）
   ========================================================================= */
(() => {
  const el = document.querySelector('.adx');
  if (!el) return;
  const svg = el.querySelector('svg');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { if (svg.pauseAnimations) svg.pauseAnimations(); return; }
  const n = el.querySelector('.adx-n');
  const box = el.querySelector('.adx-count');
  let count = 1248;
  let timer = 0;
  const tick = () => {
    count += 1;
    n.textContent = count.toLocaleString('ja-JP');
    box.classList.add('is-pop');
    setTimeout(() => box.classList.remove('is-pop'), 240);
  };
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !timer) { timer = setInterval(tick, 867); if (svg.unpauseAnimations) svg.unpauseAnimations(); }
    if (!e.isIntersecting && timer) { clearInterval(timer); timer = 0; if (svg.pauseAnimations) svg.pauseAnimations(); }
  })).observe(el);
})();

/* =========================================================================
   ㉛ Our Business：図はスクロールで起き上がる。一覧はカーソルを当てた事業のイメージが円の中に出る
   ========================================================================= */
(() => {
  const sec = document.getElementById('ourbiz');
  if (!sec) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const stage = sec.querySelector('.obiz__stage');
  const wrap = sec.querySelector('.obiz__listwrap');
  const list = sec.querySelector('.obiz__list');
  const peek = sec.querySelector('.obiz__peek');
  const imgs = Array.from(peek.querySelectorAll('img'));
  const rows = Array.from(list.querySelectorAll('.obiz__row'));
  if (reduce) { sec.querySelectorAll('svg').forEach((s) => s.pauseAnimations && s.pauseAnimations()); return; }
  // 図：画面に入ってくるにつれて、寝ていた台が起き上がる
  let raf = 0;
  const tilt = () => {
    raf = 0;
    const r = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh - r.top) / (vh * 0.9), 0, 1);
    stage.style.setProperty('--tilt', `${(16 - p * 12).toFixed(2)}deg`);
    stage.style.setProperty('--lift', `${((1 - p) * 24).toFixed(1)}px`);
  };
  if (stage) { window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tilt); }, { passive: true }); tilt(); }
  if (!fine) return;
  // 一覧：当てた行の事業のイメージを、円の中に出す（円はカーソルの高さを追いかける）
  let cy = 0; let ty = 0; let fr = 0;
  const follow = () => {
    fr = 0;
    cy += (ty - cy) * 0.14;
    peek.style.setProperty('--py', `${cy.toFixed(1)}px`);
    if (Math.abs(ty - cy) > 0.4) fr = requestAnimationFrame(follow);
  };
  const show = (i) => { peek.classList.add('on'); imgs.forEach((im, j) => im.classList.toggle('on', j === i)); rows.forEach((r, j) => r.classList.toggle('is-on', j === i)); };
  const hide = () => { peek.classList.remove('on'); rows.forEach((r) => r.classList.remove('is-on')); };
  const aim = (clientY) => {
    const w = wrap.getBoundingClientRect();
    const half = peek.offsetHeight / 2;
    ty = clamp(clientY - w.top - half, -half * 0.4, w.height - half * 1.6);
    if (!peek.classList.contains('on')) cy = ty;
    if (!fr) fr = requestAnimationFrame(follow);
  };
  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', (e) => { aim(e.clientY); show(i); });
    row.addEventListener('focusin', () => { const r = row.getBoundingClientRect(); aim(r.top + r.height / 2); show(i); });
    row.addEventListener('focusout', hide);
  });
  list.addEventListener('pointermove', (e) => aim(e.clientY));
  list.addEventListener('pointerleave', hide);
})();
