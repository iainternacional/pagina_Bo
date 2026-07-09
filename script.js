/* ===========================================================
   Tarjeta de invitación — script.js
   - Navbar fija con efecto al hacer scroll
   - Parallax sutil en el fondo del hero
   - Pétalos animados (controlados por CSS)
   - Cuenta regresiva
   - Campos condicionales
   - Validaciones del formulario RSVP
   - Guardado local + opcional Google Sheets endpoint
   - Panel admin oculto (Ctrl+Shift+R) para exportar CSV
   =========================================================== */

(() => {
  'use strict';

  // ===== Configuración opcional: enviar a Google Sheets vía Apps Script =====
  const SHEETS_ENDPOINT = "";

  // Fecha de la boda
  const WEDDING_DATE = new Date('2026-08-29T17:30:00-05:00');

  // ============== Helpers ==============
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ============== Navbar (scroll + móvil) ==============
  const navbar    = $('.navbar');
  const navToggle = $('#navToggle');
  const navMenu   = $('#navMenu');

  function onScroll() {
    if (window.scrollY > 30) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // ============== Scroll spy (navbar activa) ==============
  const navLinks = $$('.navbar__menu a[href^="#"]');
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      return el ? { id, el, link } : null;
    })
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', match);
    });
  }

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveNav(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(({ el }) => spyObserver.observe(el));
  if (sections.length) setActiveNav(sections[0].id);

  // ============== Pausar pétalos fuera de vista ==============
  const petalsEl = $('.petals');
  if (petalsEl) {
    const petalsObserver = new IntersectionObserver(([entry]) => {
      petalsEl.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      petalsEl.querySelectorAll('.petal').forEach((p) => {
        p.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });
    petalsObserver.observe($('.hero'));
  }

  // ============== Cuenta regresiva premium ==============
  const cd = {
    d: $('#cd-days'),
    h: $('#cd-hours'),
    m: $('#cd-mins'),
    s: $('#cd-secs'),
  };
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function setCountdownValue(el, value) {
    if (!el || el.textContent === value) return;
    el.classList.add('is-updating');
    setTimeout(() => {
      el.textContent = value;
      el.classList.remove('is-updating');
    }, 200);
  }

  function tickCountdown() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) {
      setCountdownValue(cd.d, '00');
      setCountdownValue(cd.h, '00');
      setCountdownValue(cd.m, '00');
      setCountdownValue(cd.s, '00');
      return;
    }
    setCountdownValue(cd.d, pad(Math.floor(diff / 86400000)));
    setCountdownValue(cd.h, pad(Math.floor((diff % 86400000) / 3600000)));
    setCountdownValue(cd.m, pad(Math.floor((diff % 3600000) / 60000)));
    setCountdownValue(cd.s, pad(Math.floor((diff % 60000) / 1000)));
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // ============== Contadores de caracteres ==============
  const messageEl   = $('#message');
  const msgCountEl  = $('#msgCount');
  messageEl?.addEventListener('input', () => { msgCountEl.textContent = messageEl.value.length; });

  // ============== Campos condicionales ==============
  const attendingFields    = $('#attendingFields');
  const companionsSelect   = $('#companions');
  const companionsNamesRow = $('#companionsNamesRow');
  const companionsNames    = $('#companionsNames');
  const attendanceRadios   = $$('input[name="attendance"]');

  function updateAttendanceUI() {
    const selected = $$('input[name="attendance"]').find(r => r.checked)?.value;
    const attending = selected === 'yes';
    attendingFields.hidden = !attending;
    if (!attending) {
      companionsSelect.value = '';
      companionsNames.value = '';
      companionsNamesRow.hidden = true;
    }
  }
  attendanceRadios.forEach(r => r.addEventListener('change', updateAttendanceUI));

  companionsSelect?.addEventListener('change', () => {
    const n = parseInt(companionsSelect.value, 10);
    if (!isNaN(n) && n > 0) {
      companionsNamesRow.hidden = false;
    } else {
      companionsNamesRow.hidden = true;
      companionsNames.value = '';
    }
  });

  // ============== Validaciones ==============
  const form = $('#rsvpForm');

  const ERR = {
    REQUIRED:  'Este campo es obligatorio.',
    EMAIL:     'Por favor, ingresa un email válido.',
    MIN_NAME:  'Ingresa al menos 3 caracteres.',
    PHONE:     'Ingresa un número de teléfono válido.',
    ATTEND:    'Indica si puedes asistir.',
    CONF:      'Selecciona tu nivel de confirmación.',
    COMPAN:    'Selecciona la cantidad de acompañantes.',
    COMPNAMES: 'Debes especificar los nombres de tus acompañantes.',
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

  function setError(field, message) {
    const input = typeof field === 'string' ? document.getElementById(field) : field;
    if (input && input.classList) input.classList.add('invalid');
    const msgEl = $(`.error-msg[data-for="${typeof field === 'string' ? field : field.id}"]`);
    if (msgEl) msgEl.textContent = message || '';
  }
  function clearError(field) {
    const input = typeof field === 'string' ? document.getElementById(field) : field;
    if (input && input.classList) input.classList.remove('invalid');
    const msgEl = $(`.error-msg[data-for="${typeof field === 'string' ? field : field.id}"]`);
    if (msgEl) msgEl.textContent = '';
  }
  function clearAllErrors() {
    $$('.error-msg').forEach(e => (e.textContent = ''));
    $$('.invalid').forEach(e => e.classList.remove('invalid'));
  }

  $('#fullName')?.addEventListener('input', () => clearError('fullName'));
  $('#email')?.addEventListener('input', () => clearError('email'));
  $('#phone')?.addEventListener('input', () => clearError('phone'));
  $('#companions')?.addEventListener('change', () => clearError('companions'));
  $('#companionsNames')?.addEventListener('input', () => clearError('companionsNames'));
  attendanceRadios.forEach(r => r.addEventListener('change', () => clearError('attendance')));
  $$('input[name="confirmation"]').forEach(r => r.addEventListener('change', () => clearError('confirmation')));

  function validate() {
    clearAllErrors();
    let ok = true;

    const fullName = $('#fullName').value.trim();
    if (fullName.length < 3) { setError('fullName', fullName ? ERR.MIN_NAME : ERR.REQUIRED); ok = false; }

    const email = $('#email').value.trim();
    if (email && !emailRegex.test(email)) { setError('email', ERR.EMAIL); ok = false; }

    const phone = $('#phone').value.trim();
    if (!phone) { setError('phone', ERR.REQUIRED); ok = false; }
    else if (!phoneRegex.test(phone)) { setError('phone', ERR.PHONE); ok = false; }

    const attendance = $$('input[name="attendance"]').find(r => r.checked)?.value;
    if (!attendance) { setError('attendance', ERR.ATTEND); ok = false; }

    if (attendance === 'yes') {
      const companions = $('#companions').value;
      if (companions === '') { setError('companions', ERR.COMPAN); ok = false; }
      else if (parseInt(companions, 10) > 0) {
        const names = $('#companionsNames').value.trim();
        if (!names) { setError('companionsNames', ERR.COMPNAMES); ok = false; }
      }
    }

    const confirmation = $$('input[name="confirmation"]').find(r => r.checked)?.value;
    if (!confirmation) { setError('confirmation', ERR.CONF); ok = false; }

    return ok;
  }

  // ============== Submit ==============
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = $('.invalid');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus({ preventScroll: true });
      return;
    }

    const attendance = $$('input[name="attendance"]').find(r => r.checked).value;
    const confirmation = $$('input[name="confirmation"]').find(r => r.checked).value;

    const data = {
      timestamp:        new Date().toISOString(),
      fullName:         $('#fullName').value.trim(),
      email:            $('#email').value.trim(),
      phone:            $('#phone').value.trim(),
      attendance,
      companions:       attendance === 'yes' ? $('#companions').value : '',
      companionsNames:  attendance === 'yes' ? $('#companionsNames').value.trim() : '',
      relation:         $('#relation').value,
      message:          $('#message').value.trim(),
      confirmation,
    };

    const submitBtn = $('#submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Enviando...';

    try {
      saveLocal(data);
      if (SHEETS_ENDPOINT) await sendToSheets(data);

      showSuccess(data);
      form.reset();
      attendingFields.hidden = true;
      companionsNamesRow.hidden = true;
      msgCountEl.textContent = '0';
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al enviar. Tus datos se guardaron localmente, te contactaremos si es necesario.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.textContent = originalText;
    }
  });

  // ============== Persistencia ==============
  function saveLocal(data) {
    const KEY = 'rsvp_responses_v2';
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.push(data);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  async function sendToSheets(data) {
    await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // ============== Modal éxito ==============
  function showSuccess(data) {
    const modal = $('#successModal');
    const text  = $('#successText');
    if (data.attendance === 'yes') {
      text.textContent = '¡Te esperamos en nuestra boda! Hemos registrado tu confirmación.';
    } else if (data.attendance === 'no') {
      text.textContent = 'Lamentamos que no puedas acompañarnos. ¡Gracias por avisarnos!';
    } else {
      text.textContent = 'Gracias por responder. Esperamos verte ese día especial.';
    }
    modal.hidden = false;
  }
  $('#closeModal')?.addEventListener('click', () => { $('#successModal').hidden = true; });
  $('#successModal .modal__backdrop')?.addEventListener('click', () => { $('#successModal').hidden = true; });

  // ============== Admin oculto (Ctrl+Shift+R) ==============
  const adminBtn = $('#adminBtn');
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
      e.preventDefault();
      adminBtn.hidden = !adminBtn.hidden;
    }
  });
  adminBtn?.addEventListener('click', () => {
    const list = JSON.parse(localStorage.getItem('rsvp_responses_v2') || '[]');
    if (!list.length) { alert('Aún no hay respuestas guardadas.'); return; }
    downloadCSV(list);
  });

  function downloadCSV(rows) {
    const headers = [
      'timestamp','fullName','email','phone','attendance','companions',
      'companionsNames','relation','message','confirmation'
    ];
    const escape = (v) => {
      const s = (v ?? '').toString().replace(/"/g, '""');
      return /[",\n;]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(Array.isArray(r[h]) ? r[h].join('|') : r[h])).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `rsvp_v2_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ============== Reproductor de música ==============
  const musicPlayer = $('#musicPlayer');
  const bgMusic     = $('#bgMusic');
  const MUSIC_KEY   = 'wedding_music_playing';

  function updateMusicUI(playing) {
    musicPlayer?.classList.toggle('is-playing', playing);
    musicPlayer?.setAttribute('aria-pressed', String(playing));
    musicPlayer?.setAttribute('aria-label', playing ? 'Pausar música de fondo' : 'Reproducir música de fondo');
  }

  musicPlayer?.addEventListener('click', async () => {
    if (!bgMusic) return;
    try {
      if (bgMusic.paused) {
        await bgMusic.play();
        sessionStorage.setItem(MUSIC_KEY, '1');
        updateMusicUI(true);
      } else {
        bgMusic.pause();
        sessionStorage.removeItem(MUSIC_KEY);
        updateMusicUI(false);
      }
    } catch {
      musicPlayer.setAttribute('title', 'Agrega assets/musica.mp3 para habilitar la música');
    }
  });

  bgMusic?.addEventListener('ended', () => updateMusicUI(false));

  // ============== Scroll reveal (IntersectionObserver) ==============
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));
})();
