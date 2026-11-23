/* Trillion Bank コーポレートサイト（5ページ版プロトタイプ）共通スクリプト */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isNarrow = () => window.innerWidth < 768;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg, ms = 2600) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* =========================================================================
     PAGE TRANSITION：ページを移るときに3枚のフレーム型の幕が閉じて開く
     ========================================================================= */
  const curtain = $('#curtain');
  const arriving = root.classList.contains('is-arriving');
  if (arriving) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-arriving')));
  }
  if (curtain && !reduce) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // 同じページ内の移動は通常どおり
      e.preventDefault();
      $('.curtain__label', curtain).textContent = a.dataset.pageLabel || '';
      curtain.classList.add('is-cover');
      store.sset('tb-nav', '1');
      setTimeout(() => { location.href = url.href; }, 640);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) curtain.classList.remove('is-cover'); });
  }

  /* =========================================================================
     OPENING（トップのみ・1回だけ）
     ========================================================================= */
  const opening = $('#opening');
  const mascot = $('#mascot');
  let openingDone = !opening;
  const ready = () => {
    root.classList.add('is-ready');
    if (mascot && !reduce) {
      mascot.classList.add('is-greeting');
      setTimeout(() => mascot.classList.remove('is-greeting'), 3200);
    }
  };
  const leaveOpening = () => {
    if (openingDone) return;
    openingDone = true;
    opening.classList.add('is-logo', 'is-leaving');
    document.body.style.overflow = '';
    store.sset('tb-opened', '1');
    ready();
    setTimeout(() => opening.classList.add('is-done'), 1100);
  };
  if (!opening || reduce || arriving || store.sget('tb-opened') === '1') {
    if (opening) { opening.classList.add('is-done'); openingDone = true; store.sset('tb-opened', '1'); }
    ready();
  } else {
    document.body.style.overflow = 'hidden';
    const num = $('#openingNum');
    let start = null;
    const DURATION = 1100;
    const tick = (now) => {
      if (openingDone) return;
      if (start === null) start = now;
      const t = clamp((now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 2);
      num.textContent = Math.min(1e12, Math.floor(Math.pow(10, 12 * eased))).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick);
      else {
        num.textContent = '1,000,000,000,000';
        setTimeout(() => !openingDone && opening.classList.add('is-logo'), 250);
        setTimeout(leaveOpening, 1900);
      }
    };
    requestAnimationFrame(tick);
    $('#openingSkip').addEventListener('click', leaveOpening);
    opening.addEventListener('click', leaveOpening);
    window.addEventListener('keydown', function onKey() { leaveOpening(); window.removeEventListener('keydown', onKey); });
  }

  /* =========================================================================
     HEADER
     ========================================================================= */
  const header = $('#header');
  const firstBlue = $('.hero, .phero');
  let lastY = window.scrollY;
  const updateHeader = () => {
    const y = window.scrollY;
    const blueEnd = firstBlue ? firstBlue.offsetTop + (firstBlue.classList.contains('hero') ? window.innerHeight * 0.7 : firstBlue.offsetHeight) - header.offsetHeight : 0;
    header.classList.toggle('is-on-blue', !!firstBlue && y < blueEnd);
    header.classList.toggle('is-solid', y > blueEnd);
    const hide = y > lastY && y > blueEnd + 200 && !document.body.classList.contains('is-drawer-open');
    header.classList.toggle('is-hidden', hide);
    document.body.classList.toggle('is-header-hidden', hide);
    lastY = y;
  };

  const menuBtn = $('#menuButton');
  const drawer = $('#drawer');
  const hunt = $('#hunt');
  const setDrawer = (open) => {
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('is-drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (mascot) mascot.classList.toggle('is-away', open);
    if (hunt) hunt.classList.toggle('is-away', open);
    if (open) drawer.querySelector('a').focus();
  };
  if (menuBtn) {
    menuBtn.addEventListener('click', () => setDrawer(drawer.hidden));
    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  }

  const motionBtn = $('#motionToggle');
  if (motionBtn) {
    motionBtn.addEventListener('click', () => {
      const paused = root.classList.toggle('is-motion-paused');
      motionBtn.setAttribute('aria-pressed', String(paused));
      motionBtn.setAttribute('aria-label', paused ? '動きを再生する' : '動きを停止する');
      $('#motionLabel').textContent = paused ? '動き：OFF' : '動き：ON';
    });
  }

  /* =========================================================================
     TEXT EFFECTS
     ========================================================================= */
  $$('[data-roll]').forEach((a) => {
    const html = a.innerHTML;
    a.innerHTML = `<span class="roll"><span>${html}</span><span aria-hidden="true">${html}</span></span>`;
  });
  $$('.split').forEach((el) => {
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
        c.style.transitionDelay = `${i * 30}ms`;
        c.style.setProperty('--i', i);
        i += 1;
        word.appendChild(c);
      });
      el.appendChild(word);
    });
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('split-ready');
  });
  $$('.hover-wave').forEach((el) => {
    let timer;
    el.addEventListener('mouseenter', () => {
      if (reduce || el.classList.contains('is-waving')) return;
      el.classList.add('is-waving');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-waving'), 700 + el.querySelectorAll('.char').length * 25);
    });
  });

  const targets = $$('.reveal, .reveal-l, .split-ready, .ceo__photo');
  if (reduce || !('IntersectionObserver' in window)) targets.forEach((t) => t.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* =========================================================================
     SCROLL-DRIVEN SCENES
     ========================================================================= */
  const vh = () => window.innerHeight;
  const progressOf = (el) => { // 要素が固定されている間の進み具合（0〜1）
    const r = el.getBoundingClientRect();
    const total = el.offsetHeight - vh();
    return total > 0 ? clamp(-r.top / total) : (r.top < 0 ? 1 : 0);
  };

  // 横スクロール
  const hscrolls = $$('.hscroll');
  const setupH = () => {
    hscrolls.forEach((sec) => {
      const track = $('.hscroll__track', sec);
      const native = reduce || isNarrow();
      sec.classList.toggle('is-native', native);
      if (native) { sec.style.height = ''; track.style.removeProperty('--hx'); return; }
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.dataset.dist = dist;
      sec.style.height = `${dist + vh() * 1.15}px`;
    });
  };

  // 固定してステップが進む図
  const pins = $$('.pin');
  const setupPins = () => {
    pins.forEach((pin) => {
      const steps = Number(pin.dataset.steps || 3);
      const stat = reduce || isNarrow() && pin.dataset.mobile !== 'pin';
      pin.classList.toggle('is-static', stat);
      pin.style.height = stat ? '' : `${(steps + 1) * 60}vh`;
      if (stat) applyStep(pin, steps, 1);
    });
  };
  const applyStep = (pin, step, p) => {
    pin.style.setProperty('--pp', p.toFixed(3));
    if (pin.dataset.step === String(step)) return;
    pin.dataset.step = step;
    $$('[data-on]', pin).forEach((el) => el.classList.toggle('is-on', step >= Number(el.dataset.on)));
    $$('[data-only]', pin).forEach((el) => {
      const on = step === Number(el.dataset.only);
      el.classList.toggle('is-on', on);
      if (el.classList.contains('deal__step')) el.hidden = !on;
    });
  };

  const hero = $('.hero');
  const circleCta = $('.circle-cta');
  const bmap = $('.bmap');
  const ceoPhoto = $('.ceo__photo');
  const pheroSym = $('.phero__sym');
  const fill = $('.fill-words');
  const fillWords = fill ? $$('.w', fill) : [];
  const drifts = $$('[data-drift]');
  const stories = $$('.story__item');
  const localLinks = $$('.local-nav a');
  const localTargets = localLinks.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const progressBar = $('#progress');
  if (circleCta && (reduce || isNarrow())) circleCta.classList.add('is-static');

  const onScroll = () => {
    updateHeader();
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - vh();
    if (progressBar) progressBar.style.setProperty('--sp', (docH > 0 ? y / docH : 0).toFixed(4));
    if (reduce) return;

    if (hero) {
      const p = progressOf(hero);
      hero.style.setProperty('--p', p.toFixed(3));
      hero.style.setProperty('--iris', clamp((p - 0.45) / 0.5).toFixed(3));
    }
    hscrolls.forEach((sec) => {
      if (sec.classList.contains('is-native')) return;
      const p = progressOf(sec);
      sec.style.setProperty('--hx', (p * Number(sec.dataset.dist || 0)).toFixed(1));
      sec.style.setProperty('--hp', p.toFixed(3));
    });
    pins.forEach((pin) => {
      if (pin.classList.contains('is-static')) return;
      const steps = Number(pin.dataset.steps || 3);
      const p = progressOf(pin);
      applyStep(pin, Math.min(steps, Math.floor(p * steps) + 1), p);
      if (pin.querySelector('.cycle')) pin.style.setProperty('--cyc', clamp(p * 1.1).toFixed(3));
    });
    if (circleCta && !circleCta.classList.contains('is-static')) {
      const p = progressOf(circleCta);
      circleCta.style.setProperty('--cp', p.toFixed(3));
      circleCta.style.setProperty('--cs', (0.06 + Math.pow(p, 1.6) * 1.05).toFixed(3));
    }
    if (bmap) {
      const r = bmap.getBoundingClientRect();
      bmap.style.setProperty('--bp', clamp((vh() - r.top) / (vh() * 0.7)).toFixed(3));
    }
    if (ceoPhoto) {
      const r = ceoPhoto.getBoundingClientRect();
      ceoPhoto.style.setProperty('--pp', clamp((vh() - r.top) / (vh() + r.height)).toFixed(3));
    }
    if (pheroSym) pheroSym.style.setProperty('--sy', (y * 0.25).toFixed(1));
    drifts.forEach((el) => {
      const r = el.getBoundingClientRect();
      const c = (r.top + r.height / 2 - vh() / 2) / vh();
      el.style.setProperty('--drift', (c * Number(el.dataset.drift)).toFixed(1));
    });
    if (fill && !fill.dataset.done) {
      const r = fill.getBoundingClientRect();
      if (r.bottom < vh() * 0.7) { fillWords.forEach((w) => w.classList.add('is-on')); fill.dataset.done = '1'; }
      else {
        const lit = Math.round(clamp((vh() * 0.9 - r.top) / (r.height + vh() * 0.2)) * fillWords.length);
        fillWords.forEach((w, i) => w.classList.toggle('is-on', i < lit));
      }
    }
    if (stories.length) {
      let best = null; let bestD = Infinity;
      stories.forEach((s) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh() * 0.5); if (d < bestD) { bestD = d; best = s; } });
      stories.forEach((s) => s.classList.toggle('is-active', s === best));
    }
    if (localTargets.length) {
      let cur = localTargets[0];
      localTargets.forEach((t) => { if (t.getBoundingClientRect().top < vh() * 0.4) cur = t; });
      localLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${cur.id}`));
    }
    updateFloaters();
  };

  /* ---------- floaters ---------- */
  const footer = $('.footer');
  let mascotOpen = false;
  function updateFloaters() {
    if (!footer) return;
    const near = footer.getBoundingClientRect().top < vh() * 0.85;
    const drawerOpen = document.body.classList.contains('is-drawer-open');
    if (mascot) mascot.classList.toggle('is-away', (near && !mascotOpen) || drawerOpen);
    if (hunt) hunt.classList.toggle('is-away', near || drawerOpen);
  }

  let ticking = false;
  const frame = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); };
  window.addEventListener('scroll', frame, { passive: true });
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { setupH(); setupPins(); if (circleCta) circleCta.classList.toggle('is-static', reduce || isNarrow()); frame(); }, 150); });
  if (reduce && fill) fillWords.forEach((w) => w.classList.add('is-on'));
  if (fill) fill.closest('section').addEventListener('focusin', () => fillWords.forEach((w) => w.classList.add('is-on')));

  /* =========================================================================
     NEWS TABS（お知らせ／プレスリリース／メディア・登壇）
     ========================================================================= */
  const tabs = $$('.tabs [role="tab"]');
  if (tabs.length) {
    const rows = $$('.nrow');
    const status = $('#newsStatus');
    tabs.forEach((t) => { const c = t.dataset.cat; const n = c === 'all' ? rows.length : rows.filter((r) => r.dataset.cat === c).length; t.insertAdjacentHTML('beforeend', `<span class="tabs__count">${n}</span>`); });
    const select = (tab, focus) => {
      const cat = tab.dataset.cat;
      tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      let n = 0;
      rows.forEach((r) => {
        const show = cat === 'all' || r.dataset.cat === cat;
        r.hidden = !show;
        r.classList.remove('is-filtered-in');
        if (show) { n += 1; void r.offsetWidth; if (!reduce) r.classList.add('is-filtered-in'); }
      });
      $('#newsEmpty').hidden = n > 0;
      status.textContent = `${tab.childNodes[0].textContent.trim()}：${n}件`;
      if (focus) tab.focus();
      if (history.replaceState) history.replaceState(null, '', cat === 'all' ? location.pathname : `${location.pathname}#${cat}`);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          select(next, true);
        }
      });
    });
    const initial = tabs.find((t) => `#${t.dataset.cat}` === location.hash) || tabs[0];
    select(initial);
  }

  /* =========================================================================
     HIDDEN FRAMES（5ページにまたがる脱出ゲーム）
     ========================================================================= */
  const KEYS = { measure: '測る', protect: '守る', record: '記録する', return: '還元する' };
  const HINTS = {
    measure: 'トップの青い空に、ひとつだけ少し明るいフレームが浮かんでいるよ。',
    protect: '「会社概要」の沿革を、横にスクロールして最後まで進んでみて。',
    record: '「事業内容」のAdctorの取引図。真ん中のAdctorの中をよく見て。',
    return: '「メンバー」のページ、採用の案内のあたりに何かあるかも。',
  };
  let found = [];
  try { found = JSON.parse(store.get('tb-frames') || '[]').filter((k) => k in KEYS); } catch (e) { found = []; }
  const huntCount = $('#huntCount');
  const mascotCount = $('#mascotCount');
  const mascotHint = $('#mascotHint');
  const render = () => {
    $$('.hunt__slots svg').forEach((s) => s.classList.toggle('is-on', found.includes(s.dataset.slot)));
    if (huntCount) huntCount.textContent = `${found.length}/4`;
    if (mascotCount) mascotCount.textContent = String(found.length);
    if (hunt) { hunt.classList.toggle('has-found', found.length > 0); hunt.setAttribute('aria-label', `隠しフレーム：${found.length}／4。ヒントを見る`); }
    $$('.key').forEach((k) => { if (found.includes(k.dataset.key)) k.classList.add('is-found'); });
    if (!mascotHint) return;
    const rest = Object.keys(KEYS).filter((k) => !found.includes(k));
    if (!rest.length) mascotHint.innerHTML = '4つ全部見つけたね！ おめでとう。キーボードで <b>trillion</b> や <b>toriuru</b> と打つと…？';
    else if (!found.length) mascotHint.textContent = 'このサイトの5つのページに、ロゴのフレームが4つ隠れているよ。カーソルを当てると光るものを探してみて！';
    else mascotHint.textContent = `あと${rest.length}つ！ ヒント：${HINTS[rest[0]]}`;
  };
  const flyTo = (el, key) => {
    if (reduce || !hunt) return;
    const a = el.getBoundingClientRect();
    const s = $(`.hunt__slots [data-slot="${key}"]`).getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'fly';
    f.innerHTML = '<svg viewBox="0 0 34 92"><use href="#tb-frame"/></svg>';
    f.style.left = `${a.left + a.width / 2 - 14}px`;
    f.style.top = `${a.top + a.height / 2 - 38}px`;
    document.body.appendChild(f);
    requestAnimationFrame(() => { f.style.transform = `translate(${s.left - a.left - a.width / 2 + 14}px, ${s.top - a.top - a.height / 2 + 30}px) scale(.4) rotate(360deg)`; f.style.opacity = '.4'; });
    setTimeout(() => f.remove(), 850);
  };
  const unlock = $('#unlock');
  let lastFocus = null;
  const openUnlock = () => {
    if (!unlock) return;
    lastFocus = document.activeElement;
    unlock.hidden = false;
    document.body.style.overflow = 'hidden';
    const conf = $('.confetti', unlock);
    conf.innerHTML = '';
    if (!reduce) for (let i = 0; i < 46; i += 1) {
      const c = document.createElement('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.setProperty('--d', `${2.4 + Math.random() * 2.2}s`);
      c.style.setProperty('--delay', `${Math.random() * 0.8}s`);
      c.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
      c.style.setProperty('--r', `${(Math.random() - 0.5) * 720}deg`);
      if (Math.random() > 0.7) c.style.background = '#c2d1ff';
      conf.appendChild(c);
    }
    setTimeout(() => $('a', unlock).focus(), 50);
  };
  const closeUnlock = () => { unlock.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus({ preventScroll: true }); };
  if (unlock) { $('#unlockClose').addEventListener('click', closeUnlock); $$('[data-close-unlock]', unlock).forEach((a) => a.addEventListener('click', closeUnlock)); }
  const collect = (key, el) => {
    if (found.includes(key)) return;
    found.push(key);
    store.set('tb-frames', JSON.stringify(found));
    flyTo(el, key);
    setTimeout(() => { render(); if (hunt) { hunt.classList.remove('is-bump'); void hunt.offsetWidth; hunt.classList.add('is-bump'); } }, reduce ? 0 : 750);
    toast(found.length < 4 ? `フレーム「${KEYS[key]}」を見つけた！（${found.length}/4）` : '4つそろった…！');
    if (found.length === 4) setTimeout(openUnlock, reduce ? 300 : 1300);
  };
  $$('.key').forEach((k) => { k.dataset.cursor = '?'; k.addEventListener('click', () => collect(k.dataset.key, k)); });

  const mascotBtn = $('#mascotBtn');
  const panel = $('#mascotPanel');
  const setMascot = (open) => {
    mascotOpen = open;
    panel.hidden = !open;
    mascotBtn.setAttribute('aria-expanded', String(open));
    mascotBtn.setAttribute('aria-label', open ? 'とりうるの寄り道案内を閉じる' : 'とりうるの寄り道案内を開く');
    if (open) { render(); $('a', panel).focus({ preventScroll: true }); }
    frame();
  };
  if (mascotBtn) {
    mascotBtn.addEventListener('click', () => setMascot(!mascotOpen));
    $('#mascotClose').addEventListener('click', () => { setMascot(false); mascotBtn.focus(); });
    if (hunt) hunt.addEventListener('click', () => setMascot(true));
  }
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (unlock && !unlock.hidden) closeUnlock();
    else if (mascotOpen) { setMascot(false); mascotBtn.focus(); }
    else if (drawer && !drawer.hidden) { setDrawer(false); menuBtn.focus(); }
  });
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (!openingDone || e.key.length !== 1 || (e.target.closest && e.target.closest('input, textarea'))) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('trillion')) { typed = ''; toast('1,000,000,000,000 の課題を、ひとつずつ。', 3200); }
    if (typed.endsWith('toriuru') && mascot) { typed = ''; mascot.classList.remove('is-jump'); void mascot.offsetWidth; mascot.classList.add('is-jump'); toast('わおーん！ 呼んだ？', 2400); }
  });

  /* =========================================================================
     POINTER（マウス操作の端末だけ）
     ========================================================================= */
  if (finePointer && !reduce) {
    const cur = $('#cursor');
    const label = $('#cursorLabel');
    let mx = -100; let my = -100; let cx = -100; let cy = -100;
    const darkSel = '.hero, .phero, .on-blue, .on-dark, .footer, .drawer, .unlock, .mapcard--blue, .mapcard--ink, .deal__node--hub, .circle-cta';
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('is-on');
      const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      cur.classList.toggle('is-hover', !!t);
      label.textContent = t ? t.dataset.cursor : '';
      cur.classList.toggle('is-dark', !!(e.target.closest && e.target.closest(darkSel)));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    const loop = () => { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- start ---------- */
  setupH();
  setupPins();
  render();
  onScroll();
  window.addEventListener('load', () => { setupH(); setupPins(); frame(); });
})();
