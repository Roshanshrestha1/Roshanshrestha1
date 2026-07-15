// ============================================================
//  Roshan Shrestha Portfolio — main.js (revamped)
//  No loading screen. Motion-rich. Respects reduced-motion.
// ============================================================

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

// Boot -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  if (window.history?.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
  }

  // Safety net: if anything prevents the IO from triggering, reveal all
  // revealed elements after the page fully loads.
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
    });
  });

  initLucide();
  initThemeToggle();
  initNavigation();
  initSmoothScrolling();
  initReveals();
  initCustomCursor();
  initMagnetic();
  initSkillRings();
  initCounters();
  initTypingRotation();
  initScrollProgress();
  initHeaderScroll();
  initMobileMenu();
  initSpotlightCards();
  initContactForm();
  initDownloadCV();
  initGitHubStats();
  initHashGuard();

  // Re-render lucide icons after dynamic SVG insertions
  if (window.lucide?.createIcons) window.lucide.createIcons();
});

// Lucide ----------------------------------------------------------------
function initLucide() {
  if (!window.lucide?.createIcons) return;
  try { window.lucide.createIcons(); } catch (_) {}
}

// Throttle ---------------------------------------------------------------
function throttle(fn, wait) {
  let last = 0, timer = null;
  return function (...args) {
    const now = Date.now();
    const elapsed = now - last;
    if (elapsed >= wait) {
      last = now; fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => { last = Date.now(); fn.apply(this, args); }, wait - elapsed);
    }
  };
}

// Scroll progress bar ----------------------------------------------------
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const update = throttle(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.setProperty('--p', `${p}%`);
  }, 16);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Header scroll behavior ------------------------------------------------
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = throttle(() => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (y > 320 && y > lastY) header.classList.add('is-hidden');
    else header.classList.remove('is-hidden');
    lastY = y;
  }, 100);
  let lastY = 0;
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Theme toggle -----------------------------------------------------------
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  btn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    // small celebratory poke
    btn.animate(
      [{ transform: 'rotate(0)' }, { transform: 'rotate(140deg)' }, { transform: 'rotate(0)' }],
      { duration: 400, easing: 'cubic-bezier(0.16,1,0.3,1)' }
    );
  });
}

// initThemeToggle no longer needs to call lucide.createIcons — icons rendered at boot

// Navigation active state ------------------------------------------------
function initNavigation() {
  const links = document.querySelectorAll('.nav-link, .dropdown-link');
  const sections = document.querySelectorAll('section[id]');

  const updateActive = throttle(() => {
    const y = window.scrollY + 120;
    let currentId = '';
    sections.forEach((s) => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) currentId = s.id;
    });
    links.forEach((l) => {
      const href = l.getAttribute('href') || '';
      l.classList.toggle('active', href === `#${currentId}`);
    });
  }, 100);
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

// Smooth scroll ----------------------------------------------------------
function initSmoothScrolling() {
  const links = document.querySelectorAll('.nav-link[href^="#"], .dropdown-link[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector('.header');
      const offset = (header?.offsetHeight || 0) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
}

// Mobile menu ------------------------------------------------------------
function initMobileMenu() {
  const toggleBtns = document.querySelectorAll('.mobile-menu-toggle');
  const dropdown = document.getElementById('dropdown-menu');
  const dropdownLinks = document.querySelectorAll('.dropdown-link');

  const close = () => {
    dropdown?.classList.remove('active');
    toggleBtns.forEach((b) => b.classList.remove('active'));
  };
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown?.classList.toggle('active');
      btn.classList.toggle('active');
    });
  });
  document.addEventListener('click', (e) => {
    if (!dropdown?.contains(e.target) && !e.target.closest('.mobile-menu-toggle')) close();
  });
  dropdownLinks.forEach((l) => l.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// Reveal animations ------------------------------------------------------
function initReveals() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  // Stagger via data-reveal-index
  els.forEach((el) => {
    const idx = parseInt(el.dataset.revealIndex || '0', 10);
    el.style.setProperty('--reveal-i', idx);
  });
  if (prefersReduced) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
}

// Skill rings ------------------------------------------------------------
function initSkillRings() {
  const rings = document.querySelectorAll('.ring');
  if (!rings.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  rings.forEach((r) => io.observe(r));
}

// Stat counters ----------------------------------------------------------
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target || 0;
      const dur = 1800;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(easeOutExpo(t) * target);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => io.observe(c));
}

// Typing rotation in hero ------------------------------------------------
function initTypingRotation() {
  const target = document.getElementById('typed-text');
  if (!target) return;
  const phrases = ['Cybersecurity Expert', 'Ethical Hacker', 'React Developer', 'Node.js Engineer'];
  let pi = 0, ci = 0, deleting = false;

  const tick = () => {
    const word = phrases[pi];
    target.textContent = word.slice(0, ci);
    if (!deleting) {
      if (ci < word.length) { ci++; setTimeout(tick, 90); }
      else { deleting = true; setTimeout(tick, 1600); }
    } else {
      if (ci > 0) { ci--; setTimeout(tick, 50); }
      else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 200); }
    }
  };
  if (prefersReduced) {
    target.textContent = phrases[0];
  } else {
    tick();
  }
}

// Custom cursor ----------------------------------------------------------
function initCustomCursor() {
  if (isCoarsePointer || prefersReduced) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
  }, { passive: true });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  // Hover state on interactive elements
  const interactives = 'a, button, .ring, .project-card, .skill-chip, .chip, .contact-item, .stat';
  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) ring.classList.add('hover');
  });
  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) ring.classList.remove('hover');
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '';
  });
}

// Magnetic buttons -------------------------------------------------------
function initMagnetic() {
  if (isCoarsePointer || prefersReduced) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const strength = 22;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Spotlight cards (mouse-follow glow) ------------------------------------
function initSpotlightCards() {
  if (prefersReduced) return;
  document.querySelectorAll('.spotlight-card, .profile-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}

// Contact form -----------------------------------------------------------
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submit = form.querySelector('.submit');

  // Floating-label friendly validation copies
  const validators = {
    name: (v) => v.length >= 2 || 'Please enter your name',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email',
    subject: (v) => v.length >= 2 || 'Add a short subject',
    message: (v) => v.length >= 8 || 'Message should be a bit longer',
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Clear errors
    form.querySelectorAll('.field-error').forEach((n) => n.remove());
    form.querySelectorAll('.error').forEach((n) => n.classList.remove('error'));
    let ok = true;
    Object.entries(validators).forEach(([k, fn]) => {
      const f = form.elements[k];
      const res = fn(f.value.trim());
      if (res !== true) {
        ok = false;
        f.classList.add('error');
        const err = document.createElement('div');
        err.className = 'field-error';
        err.textContent = res;
        f.parentElement.appendChild(err);
      }
    });
    if (!ok) return;

    submit.classList.add('is-loading');
    try {
      await simulateSend(Object.fromEntries(new FormData(form).entries()));
      submit.classList.remove('is-loading');
      submit.classList.add('is-success');
      form.reset();
      setTimeout(() => submit.classList.remove('is-success'), 2200);
    } catch (_) {
      submit.classList.remove('is-loading');
    }
  });

  // Clear error on type
  form.querySelectorAll('input, textarea').forEach((f) => {
    f.addEventListener('input', () => {
      f.classList.remove('error');
      f.parentElement.querySelector('.field-error')?.remove();
    });
  });
}

function simulateSend(data) {
  return new Promise((res) => setTimeout(res, 900));
}

// CV download ------------------------------------------------------------
function initDownloadCV() {
  const btn = document.getElementById('download-resume');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    // Allow default navigation to cv.html unless modifier keys
    if (e.metaKey || e.ctrlKey) return;
  });
}

// Strip hash on load -----------------------------------------------------
function initHashGuard() {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

// GitHub stats — direct REST API with skeleton + cached fallback ----------
function initGitHubStats() {
  const mount = document.getElementById('gh-mount');
  if (!mount) return;

  const username = 'Roshanshrestha1';
  const cacheKey = `gh-stats-${username}`;
  const cacheMs  = 1000 * 60 * 30; // 30 minutes

  const cards = [
    { key: 'repos',     eyebrow: 'Repositories', label: 'Public repos' },
    { key: 'stars',     eyebrow: 'Total stars',  label: 'Across all repos' },
    { key: 'followers', eyebrow: 'Followers',    label: 'GitHub followers' },
    { key: 'updated',   eyebrow: 'Last active',  label: 'days since last commit' },
  ];

  const renderSkeleton = () => {
    mount.innerHTML = cards
      .map(
        (c) => `
        <div class="gh-stat-card is-loading" data-key="${c.key}">
          <span class="gh-stat-eyebrow">${c.eyebrow}</span>
          <span class="gh-stat-num">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span class="gh-stat-label">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>`
      )
      .join('');
  };

  const setCard = (key, eyebrow, num, label) => {
    const card = mount.querySelector(`[data-key="${key}"]`);
    if (!card) return;
    card.classList.remove('is-loading');
    card.classList.remove('is-error');
    card.querySelector('.gh-stat-eyebrow').textContent = eyebrow;
    card.querySelector('.gh-stat-num').textContent = num;
    card.querySelector('.gh-stat-label').textContent = label;
  };

  const renderData = (data) => {
    setCard('repos', 'Repositories', data.repos, 'Public repos');
    setCard('stars', 'Total stars', data.stars, 'Across all repos');
    setCard('followers', 'Followers', data.followers, 'GitHub followers');
    setCard('updated', 'Last active', data.daysSince, 'days since last commit');

    let link = mount.querySelector('.gh-stat-link');
    if (!link) {
      link = document.createElement('a');
      link.className = 'gh-stat-link';
      link.style.gridColumn = 'span 2';
      mount.appendChild(link);
    }
    link.href = `https://github.com/${username}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `View full profile →`;
    mount.setAttribute('aria-busy', 'false');
  };

  const renderError = () => {
    cards.slice(0, 2).forEach((c) => {
      const card = mount.querySelector(`[data-key="${c.key}"]`);
      if (!card) return;
      card.classList.remove('is-loading');
      card.classList.add('is-error');
      card.querySelector('.gh-stat-eyebrow').textContent = c.eyebrow;
      card.querySelector('.gh-stat-num').textContent = '—';
      card.querySelector('.gh-stat-label').textContent = 'Live stats unavailable';
    });
    // Hide the other 2 cards entirely
    cards.slice(2).forEach((c) => {
      const card = mount.querySelector(`[data-key="${c.key}"]`);
      if (card) card.remove();
    });
    mount.setAttribute('aria-busy', 'false');
  };

  const cacheRead = () => {
    try {
      const c = JSON.parse(localStorage.getItem(cacheKey));
      return c && typeof c.fetched === 'number' ? c : null;
    } catch (_) { return null; }
  };

  const fetchAndRender = async () => {
    renderSkeleton();
    const cached = cacheRead();
    if (cached && Date.now() - cached.fetched < cacheMs) {
      renderData(cached);
      return;
    }
    try {
      const headers = { Accept: 'application/vnd.github+json' };
      const ctl = AbortSignal.timeout(8000);
      const [user, repos] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers, signal: ctl })
          .then((r) => r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, signal: ctl })
          .then((r) => r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))),
      ]);
      const totalStars = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0;
      const last = Array.isArray(repos) && repos[0] ? new Date(repos[0].updated_at) : new Date();
      const days = Math.max(0, Math.round((Date.now() - last.getTime()) / 86400000));
      const data = {
        repos: user.public_repos || 0,
        stars: totalStars,
        followers: user.followers || 0,
        daysSince: days,
      };
      try { localStorage.setItem(cacheKey, JSON.stringify({ ...data, fetched: Date.now() })); } catch (_) {}
      renderData(data);
    } catch (e) {
      console.warn('[gh-stats] fetch failed', e?.message || e);
      // Last resort: use cache even if stale
      if (cached) renderData(cached);
      else renderError();
    }
  };

  fetchAndRender();
}

// Performance: log errors (non-blocking) --------------------------------
window.addEventListener('error', (e) => console.warn('[portfolio] error', e.message));

// Service worker ---------------------------------------------------------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
