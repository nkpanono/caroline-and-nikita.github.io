// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Countdown to 18/04/2026
function updateCountdown() {
  const target = new Date('2026-04-18T00:00:00-03:00');
  const now = new Date();
  let diff = target - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');
  if (!(dEl && hEl && mEl && sEl)) return;

  dEl.textContent = days;
  hEl.textContent = String(hours).padStart(2, '0');
  mEl.textContent = String(minutes).padStart(2, '0');
  sEl.textContent = String(seconds).padStart(2, '0');
}
if (document.getElementById('days')) {
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

// RSVP AJAX submission (Formspree)
const form = document.getElementById('rsvp-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('rsvp-status');
    status.textContent = 'Enviando...';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        status.textContent = 'Recebido! Obrigado por confirmar.';
        form.reset();
      } else {
        status.textContent = 'Ops, houve um problema. Tente novamente.';
      }
    } catch (err) {
      status.textContent = 'Falha de rede. Tente novamente mais tarde.';
    }
  });
}

// --- Language toggle (both flags) ---
// Drop-in replacement that restores original PT content on toggle
(() => {
  const btns = Array.from(document.querySelectorAll('.lang-btn'));
  if (!btns.length) return;

  const root = document.documentElement;

  // Cache originals once so we can restore PT
  const i18nEls = Array.from(document.querySelectorAll('[data-i18n]'));
  i18nEls.forEach(el => {
    if (!el.dataset.original) el.dataset.original = el.innerHTML;
  });

  const saved = localStorage.getItem('lang') || 'pt';
  setLang(saved);

  btns.forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  function setLang(lang) {
    // pressed state (controls grey via CSS)
    btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

    // <html lang="…">
    root.setAttribute('lang', lang);

    // Persist
    localStorage.setItem('lang', lang);

    // Translate
    if (lang === 'pt') {
      // restore originals
      i18nEls.forEach(el => { el.innerHTML = el.dataset.original || el.innerHTML; });
    } else {
      // apply translations where available
      if (window.I18N) {
        i18nEls.forEach(el => {
          const key = el.getAttribute('data-i18n');
          const dict = window.I18N[key];
          if (dict && dict[lang]) {
            el.innerHTML = dict[lang]; // allow <br> etc.
          } else {
            // no translation: keep original PT
            el.innerHTML = el.dataset.original || el.innerHTML;
          }
        });
      }
    }

    // notify listeners if needed
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }
})();