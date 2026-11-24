/* Trillion Bank — トップページ（HTMLプロトタイプ v2） */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg, ms = 2600) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };

  /* =========================================================================
     OPENING
     0 → 1,000,000,000,000 を数え上げ → ロゴが描かれる → 3枚の幕が上がる（約3秒）
     ========================================================================= */
  const opening = $('#opening');
  const mascot = $('#mascot');
  let openingDone = false;
  const ready = () => {
    root.classList.add('is-ready');
    if (mascot && !reduce) {
      mascot.classList.add('is-greeting');
      setTimeout(() => mascot.classList.remove('is-greeting'), 3600);
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
  // ページ内の特定の場所（#airreach など）へ直接来たときは、オープニングを出さない
  const deepLink = location.hash.length > 1;
  if (reduce || deepLink || store.sget('tb-opened') === '1' || !opening) {
    if (opening) opening.classList.add('is-done');
    ready();
  } else {
    document.body.style.overflow = 'hidden';
    const num = $('#openingNum');
    const TARGET = 1e12;
    let start = null; // 最初に描画されたフレームから数え始める（フォント読み込み待ちの時間を含めない）
    const DURATION = 1100;
    const tick = (now) => {
      if (openingDone) return;
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      // 桁がひとつずつ増えていくように、対数で数え上げる
      const eased = 1 - Math.pow(1 - t, 2);
      num.textContent = Math.min(TARGET, Math.floor(Math.pow(10, 12 * eased))).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(tick);
      else {
        num.textContent = '1,000,000,000,000';
        setTimeout(() => !openingDone && opening.classList.add('is-logo'), 250);
        setTimeout(leaveOpening, 1750);
      }
    };
    requestAnimationFrame(tick);
    $('#openingSkip').addEventListener('click', leaveOpening);
    opening.addEventListener('click', leaveOpening);
    window.addEventListener('keydown', function onKey() { leaveOpening(); window.removeEventListener('keydown', onKey); });
  }

  /* =========================================================================
     HEADER / CURRENT SECTION / DOTS
     ========================================================================= */
  const header = $('#header');
  const hero = $('#top');
  const dots = $('.dots');
  let lastY = window.scrollY;
  const onScrollHeader = () => {
    const y = window.scrollY;
    // ヒーローが円に縮む演出（gp-motion.js）がある間は、その切り替え位置を使う
    // 下のページ（ヒーローがない）は、はじめから白いヘッダー
    const heroBottom = !hero ? -1 : (hero.dataset.solidAt ? Number(hero.dataset.solidAt) : hero.offsetHeight - header.offsetHeight);
    header.classList.toggle('is-solid', y > heroBottom);
    header.classList.toggle('is-hidden', y > lastY && y > heroBottom + 160 && !document.body.classList.contains('is-drawer-open'));
    if (dots) dots.classList.toggle('is-visible', y > heroBottom * 0.6);
    lastY = y;
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  const sectionIds = ['top', 'statement', 'business', 'airreach', 'adctor', 'usecases', 'media', 'news', 'company', 'ourbiz', 'members', 'contact'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        $$('.dots a, .header__nav a[href^="#"]').forEach((a) => {
          const on = a.getAttribute('href') === `#${id}`;
          a.classList.toggle('is-current', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => secIO.observe(s));
  }

  /* ---------- Drawer ---------- */
  const menuBtn = $('#menuButton');
  const drawer = $('#drawer');
  const setDrawer = (open) => {
    drawer.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('is-drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    mascot.classList.toggle('is-away', open);
    hunt.classList.toggle('is-away', open);
    if (open) drawer.querySelector('a').focus();
  };
  menuBtn.addEventListener('click', () => setDrawer(drawer.hidden));
  $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));

  /* ---------- Motion toggle（状態に合わせて表示と読み上げを更新） ---------- */
  const motionBtn = $('#motionToggle');
  const motionLabel = $('#motionLabel');
  if (motionBtn) motionBtn.addEventListener('click', () => {
    const paused = root.classList.toggle('is-motion-paused');
    motionBtn.setAttribute('aria-pressed', String(paused));
    motionBtn.setAttribute('aria-label', paused ? '動きを再生する' : '動きを停止する');
    motionLabel.textContent = paused ? '動き：OFF' : '動き：ON';
  });

  /* =========================================================================
     TEXT EFFECTS
     ========================================================================= */
  // ナビの文字がくるっと入れ替わる
  $$('[data-roll]').forEach((a) => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });

  // 英字の大見出しを1文字ずつ
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
    el.classList.add('split-ready');
  });

  // 見出しにカーソルを当てると文字が波打つ
  $$('.hover-wave').forEach((el) => {
    let timer;
    el.addEventListener('mouseenter', () => {
      if (reduce || el.classList.contains('is-waving')) return;
      // 英字が分割されていない見出し（biz）も1文字ずつに
      if (!el.querySelector('.char')) {
        let i = 0;
        $$(':scope > span', el).forEach((line) => {
          const text = line.textContent;
          line.textContent = '';
          Array.from(text).forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'char';
            c.style.display = 'inline-block';
            c.textContent = ch === ' ' ? ' ' : ch;
            c.style.setProperty('--i', i);
            i += 1;
            line.appendChild(c);
          });
        });
      }
      el.classList.add('is-waving');
      const n = el.querySelectorAll('.char').length;
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-waving'), 700 + n * 25);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const targets = $$('.reveal, .split-ready');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Statement：スクロールで言葉に色がつく（画面に入りきったら必ず全点灯） ---------- */
  const fill = $('[data-fill]');
  // 1文字ずつに分けて、スクロールに合わせて順に色がつく（Goodpatchの文字の塗り方を参考）
  if (fill && !reduce) {
    const label = fill.textContent.replace(/\s+/g, '');
    let n = 0;
    $$('.w', fill).forEach((w) => {
      const text = w.textContent;
      w.textContent = '';
      // 「、」「。」は前の文字とひとまとめにする（句読点だけが次の行に落ちないように）
      (text.match(/.[、。，．）」]*/gu) || []).forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'c';
        c.textContent = ch;
        c.style.setProperty('--ci', n);
        n += 1;
        w.appendChild(c);
      });
    });
    fill.setAttribute('aria-label', label);
  }
  const words = fill ? ($$('.c', fill).length ? $$('.c', fill) : $$('.w', fill)) : [];
  let fillDone = false;
  const updateFill = () => {
    if (!fill || fillDone) return;
    const r = fill.getBoundingClientRect();
    const vh = window.innerHeight;
    if (reduce || r.bottom < vh * 0.7) {
      words.forEach((w) => w.classList.add('is-on'));
      fillDone = true;
      return;
    }
    const progress = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (r.height + vh * 0.2)));
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
  };
  // キーボード操作などで見出しに来た場合も全点灯
  if (fill) fill.closest('section').addEventListener('focusin', () => { words.forEach((w) => w.classList.add('is-on')); fillDone = true; });

  /* ---------- Latest：円がスクロールに合わせて大きくなる ---------- */
  const latest = $('.latest');
  const circle = $('#latestCircle');
  const updateCircle = () => {
    if (!latest || !circle || reduce) return;
    const r = latest.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + 400)));
    circle.style.setProperty('--circle', (0.7 + p * 0.9).toFixed(3));
  };

  /* ---------- Mascot / hunt：フッター付近では退避 ---------- */
  const footer = $('.footer');
  const bizSection = $('#business');
  const hunt = $('#hunt');
  const updateFloaters = () => {
    const nearFooter = footer.getBoundingClientRect().top < window.innerHeight * 0.85;
    const drawerOpen = document.body.classList.contains('is-drawer-open');
    // 事業紹介が画面にある間は、本文やボタンにかぶらないよう退避する
    const br = bizSection ? bizSection.getBoundingClientRect() : null;
    const overBiz = !!(br && br.top < window.innerHeight * 0.9 && br.bottom > window.innerHeight * 0.1);
    // メンバー紹介が画面にある間も、カードにかぶらないよう退避する
    const memEl = document.getElementById('members');
    const mr = memEl ? memEl.getBoundingClientRect() : null;
    const overMembers = !!(mr && mr.top < window.innerHeight * 0.9 && mr.bottom > window.innerHeight * 0.1);
    // Use Cases のカードにも、かぶらないよう退避する
    const overUc = ['.ucx__list', '#ourbiz', '#company'].some((s) => { const el = document.querySelector(s); const ur = el ? el.getBoundingClientRect() : null; return !!(ur && ur.top < window.innerHeight * 0.9 && ur.bottom > window.innerHeight * 0.1); });
    mascot.classList.toggle('is-away', ((nearFooter || overBiz || overMembers || overUc) && !mascotOpen) || drawerOpen);
    hunt.classList.toggle('is-away', nearFooter || overBiz || overMembers || overUc || drawerOpen);
  };

  let ticking = false;
  const onFrame = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateFill(); updateCircle(); updateFloaters(); ticking = false; });
  };
  window.addEventListener('scroll', onFrame, { passive: true });
  window.addEventListener('resize', onFrame);

  /* =========================================================================
     USE CASES FILTER（件数を読み上げ、解除ボタンも出す）
     ========================================================================= */
  const filterBtns = $$('.filter [data-filter]');
  const cards = $$('#cards .card');
  const status = $('#filterStatus');
  const resetBtn = $('#filterReset');
  const applyFilter = (f) => {
    let count = 0;
    filterBtns.forEach((x) => {
      const on = x.dataset.filter === f;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', String(on));
    });
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.cat === f;
      c.hidden = !show;
      c.classList.remove('is-filtered-in');
      if (show) {
        count += 1;
        c.classList.add('is-in');
        void c.offsetWidth;
        if (!reduce) c.classList.add('is-filtered-in');
      }
    });
    const label = filterBtns.find((b) => b.dataset.filter === f).textContent;
    status.textContent = f === 'all' ? `${count}件を表示中` : `「${label}」で${count}件を表示中`;
    resetBtn.hidden = f === 'all';
  };
  filterBtns.forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  if (resetBtn) resetBtn.addEventListener('click', () => { applyFilter('all'); filterBtns[0].focus(); });

  /* =========================================================================
     HIDDEN FRAMES（脱出ゲーム）
     4つのフレームを見つけるとロゴが組み上がる隠しシーンが開く
     ========================================================================= */
  const KEYS = { measure: '測る', protect: '守る', record: '記録する', return: '還元する' };
  const HINTS = {
    measure: 'ヒーローの青い空に、ほかより少し明るいフレームが浮かんでいるよ。カーソルを当ててみて。',
    protect: '丸いエンブレムの真ん中、何回か押すと何かが落ちてくるかも…？',
    record: '「Latest Activities」の青い円。のぞきこむと中に何かが見えるよ。',
    return: 'いちばん下の、コピーライトのすぐ横。目をこらしてみて。',
  };
  let found = [];
  try { found = JSON.parse(store.get('tb-frames') || '[]').filter((k) => k in KEYS); } catch (e) { found = []; }
  const huntCount = $('#huntCount');
  const mascotCount = $('#mascotCount');
  const mascotHint = $('#mascotHint');

  const renderHunt = () => {
    $$('.hunt__slots svg').forEach((s) => s.classList.toggle('is-on', found.includes(s.dataset.slot)));
    huntCount.textContent = `${found.length}/4`;
    hunt.classList.toggle('has-found', found.length > 0);
    mascotCount.textContent = String(found.length);
    hunt.setAttribute('aria-label', `隠しフレーム：${found.length}／4。ヒントを見る`);
    $$('.key').forEach((k) => { if (found.includes(k.dataset.key)) k.classList.add('is-found'); });
    if (found.includes('record')) circle.classList.add('is-found');
    const rest = Object.keys(KEYS).filter((k) => !found.includes(k));
    if (rest.length === 0) {
      mascotHint.innerHTML = '4つ全部見つけたね！おめでとう。ちなみに、キーボードで <b>trillion</b> や <b>toriuru</b> と打つと…？';
    } else if (found.length === 0) {
      mascotHint.textContent = 'このページのどこかに、ロゴのフレームが4つ隠れているよ。カーソルを当てると光るものを探してみて！';
    } else {
      mascotHint.textContent = `あと${rest.length}つ！ ヒント：${HINTS[rest[0]]}`;
    }
  };

  const flyTo = (fromEl, slotKey) => {
    if (reduce) return;
    const from = fromEl.getBoundingClientRect();
    const slot = $(`.hunt__slots [data-slot="${slotKey}"]`).getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.innerHTML = '<svg viewBox="0 0 34 92"><use href="#tb-frame"/></svg>';
    fly.style.left = `${from.left + from.width / 2 - 14}px`;
    fly.style.top = `${from.top + from.height / 2 - 38}px`;
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${slot.left - from.left - from.width / 2 + 14}px, ${slot.top - from.top - from.height / 2 + 30}px) scale(.4) rotate(360deg)`;
      fly.style.opacity = '.4';
    });
    setTimeout(() => fly.remove(), 850);
  };

  const collect = (key, el) => {
    if (found.includes(key)) return;
    found.push(key);
    store.set('tb-frames', JSON.stringify(found));
    flyTo(el, key);
    setTimeout(() => {
      renderHunt();
      hunt.classList.remove('is-bump'); void hunt.offsetWidth; hunt.classList.add('is-bump');
    }, reduce ? 0 : 750);
    toast(found.length < 4 ? `フレーム「${KEYS[key]}」を見つけた！（${found.length}/4）` : '4つそろった…！');
    if (found.length === 4) setTimeout(openUnlock, reduce ? 300 : 1300);
  };

  $$('.key').forEach((k) => {
    k.dataset.cursor = '?';
    k.addEventListener('click', () => collect(k.dataset.key, k));
  });

  // 守る：エンブレムを3回まわすと、フレームが落ちてくる
  const core = $('#emblemCore');
  const emblemKey = $('.key--emblem');
  let turns = 0;
  if (core) core.dataset.cursor = '回す';
  if (core) core.addEventListener('click', () => {
    turns += 1;
    core.style.setProperty('--turn', `${turns * 120}deg`);
    core.classList.add('is-spin');
    if (found.includes('protect')) { toast('もう見つけたフレームだよ'); return; }
    if (turns === 1) toast('…カチッ');
    if (turns === 2) toast('…カチカチッ');
    if (turns >= 3 && emblemKey.hidden) {
      emblemKey.hidden = false;
      toast('何かが落ちてきた…！');
      emblemKey.focus({ preventScroll: true });
    }
  });

  // 記録する：青い円の中
  if (circle) circle.dataset.cursor = 'のぞく';
  if (circle) circle.addEventListener('click', () => {
    if (found.includes('record')) { toast('円の中はもう空っぽだよ'); return; }
    collect('record', circle);
    circle.classList.add('is-found');
  });

  /* ---------- Unlock scene ---------- */
  const unlock = $('#unlock');
  let lastFocus = null;
  const openUnlock = () => {
    lastFocus = document.activeElement;
    unlock.hidden = false;
    document.body.style.overflow = 'hidden';
    const conf = $('#confetti');
    conf.innerHTML = '';
    if (!reduce) {
      for (let i = 0; i < 46; i += 1) {
        const c = document.createElement('i');
        c.style.left = `${Math.random() * 100}%`;
        c.style.setProperty('--d', `${2.4 + Math.random() * 2.2}s`);
        c.style.setProperty('--delay', `${Math.random() * 0.8}s`);
        c.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
        c.style.setProperty('--r', `${(Math.random() - 0.5) * 720}deg`);
        c.style.background = Math.random() > 0.7 ? '#c2d1ff' : '#fff';
        conf.appendChild(c);
      }
    }
    setTimeout(() => unlock.querySelector('a').focus(), 50);
  };
  const closeUnlock = () => {
    unlock.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  $('#unlockClose').addEventListener('click', closeUnlock);
  $$('[data-close-unlock]').forEach((a) => a.addEventListener('click', closeUnlock));

  /* ---------- Mascot panel ---------- */
  const mascotBtn = $('#mascotBtn');
  const panel = $('#mascotPanel');
  let mascotOpen = false;
  const setMascot = (open) => {
    mascotOpen = open;
    panel.hidden = !open;
    mascotBtn.setAttribute('aria-expanded', String(open));
    mascotBtn.setAttribute('aria-label', open ? 'とりうるの寄り道案内を閉じる' : 'とりうるの寄り道案内を開く');
    if (open) { renderHunt(); panel.querySelector('a').focus({ preventScroll: true }); }
    onFrame();
  };
  mascotBtn.addEventListener('click', () => setMascot(!mascotOpen));
  $('#mascotClose').addEventListener('click', () => { setMascot(false); mascotBtn.focus(); });
  hunt.addEventListener('click', () => setMascot(true));

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!unlock.hidden) closeUnlock();
    else if (mascotOpen) { setMascot(false); mascotBtn.focus(); }
    else if (!drawer.hidden) { setDrawer(false); menuBtn.focus(); }
  });

  /* ---------- 隠しキーワード：trillion / toriuru ---------- */
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (opening && !openingDone && !opening.classList.contains('is-done')) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('trillion')) {
      typed = '';
      toast('1,000,000,000,000 の課題を、ひとつずつ。', 3200);
      if (!reduce) {
        const sw = document.createElement('div');
        sw.className = 'sweep';
        sw.innerHTML = '<svg viewBox="0 0 414 60" preserveAspectRatio="none"><path pathLength="1" d="M0 30 H105 C130 30 140 4 166 4 C200 4 216 56 256 56 C286 56 296 30 322 30 H414"/></svg>';
        document.body.appendChild(sw);
        setTimeout(() => sw.remove(), 1600);
      }
    }
    if (typed.endsWith('toriuru')) {
      typed = '';
      mascot.classList.remove('is-jump'); void mascot.offsetWidth; mascot.classList.add('is-jump');
      toast('わおーん！ 呼んだ？', 2400);
    }
  });

  /* =========================================================================
     POINTER EFFECTS（マウス操作の端末だけ）
     ========================================================================= */
  if (finePointer && !reduce) {
    // 行き先の名前を出すカーソル
    const cur = $('#cursor');
    const curLabel = $('#cursorLabel');
    let mx = -100; let my = -100; let cx = -100; let cy = -100;
    const darkSel = '.hero, .bz-band--blue, .bz-split.is-flood, .contact, .media, .footer, .drawer, .unlock, .card__img--ink, .card__img--blue, .bubble--accent, .uc--navy .uc__card, .uc--blue .uc__card, .cov, .obiz';
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('is-on');
      const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      cur.classList.toggle('is-hover', !!t);
      curLabel.textContent = t ? t.dataset.cursor : '';
      cur.classList.toggle('is-dark', !!(e.target.closest && e.target.closest(darkSel)) && !t);
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
    const loop = () => {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    // ボタンがカーソルに少し吸い寄せられる
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // ヒーローの形がマウスに合わせてゆっくり動く
    const shapes = $('.hero__shapes');
    if (hero && shapes) hero.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * -30;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      shapes.style.setProperty('--px', `${x}px`);
      shapes.style.setProperty('--py', `${y}px`);
    });

    // メディアの背景文字がマウスに合わせて横に流れる
    const media = $('.media');
    const mediaBg = $('.media__bg');
    if (media && mediaBg) media.addEventListener('pointermove', (e) => {
      mediaBg.style.setProperty('--mx', `${(e.clientX / window.innerWidth - 0.5) * -80}px`);
    });
  }

  /* ---------- start ---------- */
  renderHunt();
  onFrame();
  setTimeout(onFrame, 400);
})();
