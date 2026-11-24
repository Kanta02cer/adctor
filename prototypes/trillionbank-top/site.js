/* =========================================================================
   site.js：複数ページで共通の小さな動き
   ========================================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 下からふわっと現れる（同じ並びの中で少しずつ遅らせる）
  const items = Array.from(document.querySelectorAll('.pair__card, .flow4__list li, .price__list li, .cant__list li, .values__list li, .profile2__dl > div, .toll__steps li, .ppc__kinds li, .git__o, .git__text, .band-link__inner > *, .phero__actions .orb, .chips li'));
  if (!reduce && 'IntersectionObserver' in window) {
    items.forEach((el) => {
      const sibs = Array.from(el.parentElement.children);
      el.style.setProperty('--rd', `${Math.min(sibs.indexOf(el), 6) * 0.08}s`);
      el.classList.add('rv');
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
    const share = document.querySelector('.share');
    if (share) {
      const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { share.classList.add('is-in'); io2.disconnect(); } }), { threshold: 0.3 });
      io2.observe(share);
    }
  } else {
    const share = document.querySelector('.share');
    if (share) share.classList.add('is-in');
  }
})();
