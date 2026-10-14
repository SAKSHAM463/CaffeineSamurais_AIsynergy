/* =========================================================
   Beyond the Fort — interactions, animation & data
   ========================================================= */
(function () {
  'use strict';
  const D = window.BTF;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGSAP = typeof window.gsap !== 'undefined';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Loader ---------- */
  const bar = $('#loader-progress');
  let prog = 0;
  const loadTimer = setInterval(() => { prog = Math.min(prog + Math.random() * 18, 92); bar.style.width = prog + '%'; }, 120);
  function finishLoad() {
    clearInterval(loadTimer); bar.style.width = '100%';
    setTimeout(() => { $('#loader').classList.add('done'); heroIntro(); }, 350);
  }
  let loaded = false;
  const tryFinish = () => { if (!loaded) { loaded = true; finishLoad(); } };
  if (window.__sceneReady) setTimeout(tryFinish, 600);
  window.addEventListener('scene:ready', () => setTimeout(tryFinish, 600));
  setTimeout(tryFinish, 3500); // safety

  /* ---------- Render static content ---------- */
  $('#evidence-grid').innerHTML = D.evidence.map(e => `
    <article class="ev-card" tabindex="0" aria-label="${esc(e.signal)}">
      <div class="ev-inner">
        <div class="ev-face ev-front">
          <i class="fa-solid ${e.icon} ev-icon"></i>
          <div><span class="ev-label">Signal</span><h4>${esc(e.signal)}</h4></div>
          <p>${esc(e.evidence)}</p>
          <span class="ev-hint">Hover / tap → what remains uncertain</span>
        </div>
        <div class="ev-face ev-back">
          <span class="ev-label">What remains uncertain</span>
          <p>${esc(e.unknown)}</p>
          <i class="fa-solid fa-circle-question" style="font-size:2rem;opacity:.6"></i>
        </div>
      </div>
    </article>`).join('');
  $$('.ev-card').forEach(c => c.addEventListener('click', () => c.classList.toggle('flipped')));

  $('#hscroll-track').innerHTML = D.workflow.map((w, i) => `
    <article class="wf-step">
      <span class="wf-num">${String(i + 1).padStart(2, '0')}</span>
      <i class="fa-solid ${w.icon} wf-icon"></i>
      <p class="wf-tag" style="margin-top:1rem">${esc(w.tag)}</p>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.text)}</p>
      <ul>${w.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <div class="wf-out">${esc(w.out)}</div>
    </article>`).join('');

  $('#verdict-grid').innerHTML = D.verdicts.map(v => `
    <article class="verdict ${v.k}" data-tilt>
      <span class="verdict-tag"><i class="fa-solid ${v.k === 'go' ? 'fa-circle-check' : v.k === 'stop' ? 'fa-circle-xmark' : 'fa-triangle-exclamation'}"></i> ${esc(v.tag)}</span>
      <h4>${esc(v.title)}</h4><p>${esc(v.text)}</p><div class="fix">${v.fix}</div>
    </article>`).join('');

  /* ---------- Framings scoring ---------- */
  const weights = { evidence: 4, feasible: 3, inclusion: 4, safety: 3 };
  function renderFramings(animate) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const scored = D.framings.map(f => ({ ...f, score: Object.keys(weights).reduce((a, k) => a + f.s[k] * weights[k], 0) / total }))
      .sort((a, b) => b.score - a.score);
    const box = $('#framings');
    const first = {};
    $$('.framing', box).forEach(el => first[el.dataset.id] = el.getBoundingClientRect().top);
    box.innerHTML = scored.map((f, i) => `
      <div class="framing ${f.id === 'avail' ? 'selected' : ''}" data-id="${f.id}">
        <span class="rank">${i + 1}</span>
        <div><h4>${esc(f.title)}${f.id === 'avail' ? '<span class="chosen">Our pick</span>' : ''}</h4><p>${esc(f.text)}</p></div>
        <div class="bar"><span style="width:${(f.score / 5) * 100}%"></span></div>
        <span class="score">${f.score.toFixed(2)}</span>
      </div>`).join('');
    if (animate && hasGSAP) {
      $$('.framing', box).forEach(el => {
        const prev = first[el.dataset.id];
        if (prev !== undefined) {
          const dy = prev - el.getBoundingClientRect().top;
          if (dy) gsap.fromTo(el, { y: dy }, { y: 0, duration: .7, ease: 'power3.out' });
        }
      });
    }
  }
  renderFramings(false);
  $$('#weights input').forEach(inp => inp.addEventListener('input', () => {
    weights[inp.dataset.w] = +inp.value;
    inp.nextElementSibling.textContent = inp.value;
    renderFramings(true);
  }));

  /* ---------- Countries ---------- */
  const cc = $('#cc-select');
  cc.innerHTML = D.countries.map(([n, c]) => `<option value="${c}">${esc(n)} (${c})</option>`).join('');
  cc.addEventListener('change', () => { $('#cc-prefix').textContent = cc.value; });

  /* ---------- Login demo ---------- */
  const msg = $('#login-msg');
  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    const num = $('#phone-input').value.replace(/\D/g, '');
    const code = cc.value.replace(/\D/g, '');
    const full = code.length + num.length;
    msg.classList.remove('err');
    if (num.length < 4 || full < 8 || full > 15) {
      msg.textContent = 'Please enter a valid number (E.164 allows 8–15 digits including country code).';
      msg.classList.add('err'); return;
    }
    msg.textContent = `Demo: code "sent" to ${cc.value} ${num}. No SMS is sent from this prototype.`;
    const row = $('#otp-row'); row.hidden = false;
    const inputs = $$('input', row); inputs[0].focus();
    inputs.forEach((inp, i) => {
      inp.oninput = () => {
        inp.value = inp.value.replace(/\D/g, '');
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
        if (inputs.every(x => x.value)) { msg.textContent = '✓ Signed in (demo). Welcome to Gwalior!'; toast('Signed in — enjoy Beyond the Fort'); }
      };
      inp.onkeydown = ev => { if (ev.key === 'Backspace' && !inp.value && inputs[i - 1]) inputs[i - 1].focus(); };
    });
  });

  /* ---------- Toast ---------- */
  const toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
  let toastT;
  function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600); }

  /* ---------- Data: events & guides ---------- */
  let EVENTS = [], GUIDES = [];
  const state = { day: 0, cat: 'all', q: '' };
  async function fetchTable(name) {
    try {
      const r = await fetch(`tables/${name}?limit=100`);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      return j.data || [];
    } catch (e) { return null; }
  }
  const statusLabel = { verified: ['fa-circle-check', 'Verified'], stakeholder: ['fa-user-pen', 'Stakeholder-provided'], inferred: ['fa-wand-magic-sparkles', 'Inferred'] };
  const dayName = d => d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : new Date(Date.now() + d * 864e5).toLocaleDateString('en-IN', { weekday: 'long' });

  function eventCard(e) {
    const [ic, lbl] = statusLabel[e.source_status] || statusLabel.inferred;
    return `<article class="event-card ${e.capacity === 'full' ? 'is-full' : ''}" data-id="${esc(e.id)}" tabindex="0" data-tilt>
      <div class="event-top"><span class="event-cat">${esc(e.category)}</span><span class="cap ${esc(e.capacity)}">${esc(e.capacity)}</span></div>
      <h4>${esc(e.title)}</h4>
      <div class="event-meta">
        <span><i class="fa-regular fa-clock"></i> ${dayName(+e.day_offset)} · ${esc(e.time)}</span>
        <span><i class="fa-solid fa-location-dot"></i> ${esc(e.venue)}</span>
        <span><i class="fa-solid fa-route"></i> ${Number(e.distance_km).toFixed(1)} km from fort corridor</span>
      </div>
      <div class="event-foot"><span class="badge ${esc(e.source_status)}"><i class="fa-solid ${ic}"></i> ${lbl}</span><span class="event-price">${esc(e.price)}</span></div>
    </article>`;
  }
  function renderEvents() {
    const q = state.q.toLowerCase();
    const list = EVENTS.filter(e => (state.day === 7 ? true : +e.day_offset === state.day))
      .filter(e => state.cat === 'all' || e.category === state.cat)
      .filter(e => !q || [e.title, e.venue, e.area, e.category].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (+a.day_offset - +b.day_offset) || String(a.time).localeCompare(String(b.time)));
    const grid = $('#event-grid');
    if (!list.length) { grid.innerHTML = '<p class="empty">Nothing listed for this filter yet — try another day or category.</p>'; return; }
    let html = '';
    const full = list.filter(e => e.capacity === 'full');
    list.forEach(e => { html += eventCard(e); });
    if (full.length) {
      const alts = EVENTS.filter(e => e.capacity !== 'full' && +e.day_offset <= Math.max(1, +full[0].day_offset)).sort((a, b) => a.distance_km - b.distance_km).slice(0, 3);
      html = `<div class="planb"><i class="fa-solid fa-life-ring"></i><div><h4>${esc(full[0].title.split('—')[0].trim())} is full — here's your plan B</h4>
        <p>${alts.map(a => `<b>${esc(a.title)}</b> (${dayName(+a.day_offset)} ${esc(a.time)}, ${Number(a.distance_km).toFixed(1)} km)`).join(' · ')}</p></div></div>` + html;
    }
    grid.innerHTML = html;
    if (hasGSAP && !reduced) gsap.from($$('.event-card', grid), { y: 60, opacity: 0, rotateX: -25, duration: .8, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
    bindTilt(grid);
  }
  function openEvent(id) {
    const e = EVENTS.find(x => x.id === id); if (!e) return;
    const [ic, lbl] = statusLabel[e.source_status] || statusLabel.inferred;
    const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.venue + ', Gwalior');
    $('#modal-body').innerHTML = `
      <span class="badge ${esc(e.source_status)}"><i class="fa-solid ${ic}"></i> ${lbl}</span>
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.description || '')}</p>
      <p><i class="fa-regular fa-clock"></i> ${dayName(+e.day_offset)} · ${esc(e.time)} &nbsp; <i class="fa-solid fa-ticket"></i> ${esc(e.price)} &nbsp; <span class="cap ${esc(e.capacity)}">${esc(e.capacity)}</span></p>
      <p class="sens"><b>Local norms:</b> ${esc(e.sensitivity || 'None noted.')}</p>
      ${e.source_status !== 'verified' ? '<p style="font-size:.95rem;font-style:italic;color:#b9ab90">This listing is not independently verified. Please confirm timings with the host before travelling.</p>' : ''}
      <div class="modal-actions">
        <a class="btn btn-gold" href="${mapUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-map-location-dot"></i> Open in maps</a>
        <button class="btn btn-line" id="modal-save"><i class="fa-regular fa-bookmark"></i> Save to my day</button>
      </div>`;
    $('#event-modal').showModal();
    $('#modal-save').onclick = () => { toast('Saved to your day plan'); };
  }
  $('#event-grid').addEventListener('click', e => { const c = e.target.closest('.event-card'); if (c) openEvent(c.dataset.id); });
  $('#event-grid').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.event-card'); if (c) openEvent(c.dataset.id); } });
  $('.modal-close').addEventListener('click', () => $('#event-modal').close());
  $('#event-modal').addEventListener('click', e => { if (e.target.id === 'event-modal') e.target.close(); });

  $$('#day-tabs button').forEach(b => b.addEventListener('click', () => { $$('#day-tabs button').forEach(x => x.classList.remove('active')); b.classList.add('active'); state.day = +b.dataset.day; renderEvents(); }));
  $$('#cat-tabs button').forEach(b => b.addEventListener('click', () => { $$('#cat-tabs button').forEach(x => x.classList.remove('active')); b.classList.add('active'); state.cat = b.dataset.cat; renderEvents(); }));
  let sT; $('#event-search').addEventListener('input', e => { clearTimeout(sT); sT = setTimeout(() => { state.q = e.target.value; renderEvents(); }, 200); });

  function renderGuides() {
    $('#guide-grid').innerHTML = GUIDES.map(g => {
      const initials = String(g.name).split(' ').map(s => s[0]).join('').slice(0, 2);
      const sites = Array.isArray(g.sites) ? g.sites : [];
      const langs = Array.isArray(g.languages) ? g.languages : [];
      return `<article class="guide-card" data-tilt>
        <div class="guide-avatar"><span>${esc(initials)}</span></div>
        <span class="guide-role">${esc(g.role)}</span>
        <h4>${esc(g.name)}</h4>
        <p class="guide-spec">${esc(g.specialty)}</p>
        <div class="guide-chips">${sites.map(s => `<span>${esc(s)}</span>`).join('')}${langs.map(l => `<span>🗣 ${esc(l)}</span>`).join('')}</div>
        <div class="guide-checks">
          <span class="${g.site_qualified ? 'ok' : 'no'}"><i class="fa-solid ${g.site_qualified ? 'fa-circle-check' : 'fa-clock'}"></i> ${g.site_qualified ? 'Qualified for listed sites' : 'Qualification pending'}</span>
          <span class="${g.accountable ? 'ok' : 'no'}"><i class="fa-solid ${g.accountable ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${g.accountable ? 'Accountable: masked contact + complaints' : 'Accountability not yet set up'}</span>
          <span style="color:#555"><i class="fa-solid fa-certificate"></i> ${esc(g.credential)}</span>
        </div>
        <div class="guide-rating"><i class="fa-solid fa-star"></i> ${Number(g.rating).toFixed(1)} · ${esc(g.tours)} completed tours</div>
        <button class="btn guide-contact" data-name="${esc(g.name)}"><i class="fa-solid fa-phone-slash"></i> Contact via masked line</button>
      </article>`;
    }).join('') || '<p class="empty">No guides listed yet.</p>';
    $$('.guide-contact').forEach(b => b.addEventListener('click', () => toast(`Demo: masked call request sent to ${b.dataset.name}. Numbers stay hidden.`)));
    bindTilt($('#guide-grid'));
    if (hasGSAP && !reduced) gsap.from($$('.guide-card'), { scrollTrigger: { trigger: '#guide-grid', start: 'top 85%' }, y: 80, opacity: 0, rotateY: 25, duration: 1, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  (async () => {
    const [ev, gd] = await Promise.all([fetchTable('events'), fetchTable('guides')]);
    EVENTS = ev && ev.length ? ev : D.fallbackEvents;
    GUIDES = gd && gd.length ? gd : D.fallbackGuides;
    renderEvents(); renderGuides();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  })();

  /* ---------- 3D tilt ---------- */
  function bindTilt(root = document) {
    if (window.matchMedia('(hover:none)').matches || reduced) return;
    $$('[data-tilt]', root).forEach(el => {
      if (el.__tilt) return; el.__tilt = true;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg) translateZ(10px)`;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  bindTilt();

  /* ---------- Custom cursor & magnetic ---------- */
  const cur = $('#cursor');
  if (!window.matchMedia('(hover:none)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', e => { cur.classList.toggle('hover', !!e.target.closest('a,button,[data-tilt],.ev-card,input,select')); });
    $$('.magnetic').forEach(m => {
      m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .4}px)`; });
      m.addEventListener('pointerleave', () => { m.style.transform = ''; });
    });
  }

  /* ---------- Header / nav ---------- */
  const header = $('#site-header');
  const nav = $('#main-nav'), tog = $('#menu-toggle');
  tog.addEventListener('click', () => { const o = nav.classList.toggle('open'); tog.setAttribute('aria-expanded', o); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); nav.classList.remove('open'); tog.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.scrollTo(t, { offset: -60, duration: 1.6 }); else t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    }
  }

  const prog2 = $('#scroll-progress');
  const sections = $$('main section[id]');
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    prog2.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    let cur = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s.id; });
    $$('#main-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Split words ---------- */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'word';
            const i = document.createElement('span'); i.textContent = part; w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    };
    walk(el);
  }
  $$('.split-words').forEach(splitWords);

  /* ---------- Hero intro ---------- */
  function heroIntro() {
    countUp();
    if (!hasGSAP || reduced) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-title .split', { yPercent: 110, rotate: 6, duration: 1.6, stagger: .12 })
      .from('#hero-section .reveal-up', { y: 40, opacity: 0, duration: 1.2, stagger: .1 }, '-=1.2')
      .from('.hero-stats .stat', { y: 30, opacity: 0, duration: 1, stagger: .1 }, '-=.9')
      .from('#site-header', { y: -80, opacity: 0, duration: 1 }, '-=1.2');
  }
  function countUp() {
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count; const t0 = performance.now();
      (function step(t) { const p = Math.min(1, (t - t0) / 1800); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
    });
  }

  /* ---------- Scroll animations ---------- */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    $$('.split-words').forEach(el => {
      gsap.from($$('.word > span', el), { yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .035,
        scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('.kicker, .section-lede').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

    gsap.from('.problem-card', { y: 120, opacity: 0, rotateX: -30, duration: 1.3, stagger: .2, ease: 'expo.out', scrollTrigger: { trigger: '.loop-wrap', start: 'top 80%' } });
    gsap.from('.loop-center', { scale: 0, rotate: -180, duration: 1.4, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.loop-wrap', start: 'top 75%' } });
    gsap.from('.ev-card', { y: 100, opacity: 0, rotateY: -40, duration: 1.1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#evidence-grid', start: 'top 82%' } });
    gsap.from('.flow-steps li', { y: 80, opacity: 0, scale: .9, duration: .9, stagger: .08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#flow-steps', start: 'top 85%' } });
    gsap.from('.check-card', { y: 60, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.two-checks', start: 'top 85%' } });
    gsap.from('.verdict', { y: 80, opacity: 0, rotateX: -20, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#verdict-grid', start: 'top 85%' } });
    gsap.from('.req', { x: -60, opacity: 0, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.srs-reqs', start: 'top 80%' } });
    gsap.from('.road-item', { x: 60, opacity: 0, duration: .9, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '#roadmap', start: 'top 80%' } });
    gsap.to('.road-line span', { height: '100%', ease: 'none', scrollTrigger: { trigger: '#roadmap', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.from('.statement-tags span', { y: 30, opacity: 0, stagger: .08, duration: .8, scrollTrigger: { trigger: '.statement-tags', start: 'top 90%' } });
    gsap.from('.boundary-card', { scale: .85, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.boundary-card', start: 'top 85%' } });
    gsap.from('.login-card', { rotateY: 30, x: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.login-card', start: 'top 85%' } });
    gsap.from('.footer-big', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#site-footer', start: 'top 90%' } });
    gsap.to('.marquee', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.hero-title', { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#hero-section', start: 'top top', end: 'bottom top', scrub: true } });

    // Horizontal workflow scroll (pinned)
    const track = $('#hscroll-track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '#hscroll', start: 'center center', end: () => '+=' + dist(), pin: '#workflow-section', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.from('.wf-step', { y: 100, opacity: 0, rotateZ: 3, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '#hscroll', start: 'top 85%' } });

    ScrollTrigger.create({ trigger: '#terminal', start: 'top 75%', once: true, onEnter: typeTrail });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    // no GSAP: simple horizontal overflow + immediate trail
    $('#hscroll').style.overflowX = 'auto';
    typeTrail();
  }

  /* ---------- Reasoning trail typing ---------- */
  let typed = false;
  function typeTrail() {
    if (typed) return; typed = true;
    const body = $('#term-body');
    const lines = D.trail;
    let li = 0;
    function nextLine() {
      if (li >= lines.length) { body.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); return; }
      const [cls, tag, text] = lines[li++];
      const row = document.createElement('div');
      row.innerHTML = `<span style="color:#6b6380">[${String(li).padStart(2, '0')}]</span> <span class="${cls}">${tag}</span> → <span class="txt"></span>`;
      body.appendChild(row);
      const span = $('.txt', row); let ci = 0;
      (function typeCh() { span.textContent = text.slice(0, ++ci); if (ci < text.length) setTimeout(typeCh, reduced ? 0 : 12); else setTimeout(nextLine, 140); })();
    }
    nextLine();
  }
})();
