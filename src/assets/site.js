(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    revealer.observe(el);
  });

  // Animated counters
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target) || 0;
        counterObserver.unobserve(el);
        if (reduceMotion) return;
        const duration = 1600;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min((t - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

  // Nav: scroll state, progress bar, active section
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.progress');
  const onScroll = () => {
    const max = root.scrollHeight - root.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = document.querySelectorAll('[data-nav]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('active', l.dataset.nav === entry.target.id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('nav-links');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('open', !open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  });
})();
