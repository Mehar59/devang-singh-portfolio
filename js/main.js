/* Devang Singh — portfolio interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const IMG = (k, sm) => `assets/img/${k}${sm ? '-sm' : ''}.webp`;

  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

  /* ------------------------------------------------------------------ */
  /* Smooth scroll                                                       */
  /* ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else (typeof target === 'string' ? $(target) : target).scrollIntoView({ behavior: 'smooth' });
  };
  const lockScroll = on => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };

  /* ------------------------------------------------------------------ */
  /* Build dynamic content: archive, filters                             */
  /* ------------------------------------------------------------------ */
  const grid = $('.archive__grid');
  ARCHIVE.forEach(([key, cat, cap, shape], i) => {
    const t = document.createElement('figure');
    t.className = `tile ${shape || ''}`;
    t.dataset.cat = cat;
    t.dataset.index = i;
    t.dataset.cursor = 'View';
    t.innerHTML = `<img src="${IMG(key, true)}" alt="${cap}" loading="lazy"><figcaption class="tile__cap"><strong>${cap}</strong><span class="mono">${cat}</span></figcaption>`;
    grid.appendChild(t);
  });
  const cats = ['All', ...new Set(ARCHIVE.map(a => a[1]))];
  const filters = $('.filters');
  cats.forEach((c, i) => {
    const n = c === 'All' ? ARCHIVE.length : ARCHIVE.filter(a => a[1] === c).length;
    const b = document.createElement('button');
    b.className = 'filter' + (i === 0 ? ' is-active' : '');
    b.dataset.filter = c;
    b.setAttribute('role', 'tab');
    b.innerHTML = `${c}<sup>${String(n).padStart(2, '0')}</sup>`;
    filters.appendChild(b);
  });
  filters.addEventListener('click', e => {
    const b = e.target.closest('.filter');
    if (!b || b.classList.contains('is-active')) return;
    $$('.filter', filters).forEach(f => f.classList.toggle('is-active', f === b));
    const f = b.dataset.filter;
    const tiles = $$('.tile', grid);
    const state = Flip.getState(tiles);
    tiles.forEach(t => t.classList.toggle('is-hidden', f !== 'All' && t.dataset.cat !== f));
    Flip.from(state, {
      duration: 0.8, ease: 'expo.inOut', absolute: true, scale: true, nested: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh()
    });
  });

  /* ------------------------------------------------------------------ */
  /* Loader                                                              */
  /* ------------------------------------------------------------------ */
  const svg = $('.loader__plan');
  const NS = 'http://www.w3.org/2000/svg';
  PLAN.walls.forEach((w, i) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', w[0]); l.setAttribute('y1', w[1]); l.setAttribute('x2', w[2]); l.setAttribute('y2', w[3]);
    if (i < 4) l.setAttribute('class', 'lp-outer');
    const len = Math.hypot(w[2] - w[0], w[3] - w[1]);
    l.style.strokeDasharray = len; l.style.strokeDashoffset = len;
    svg.appendChild(l);
  });
  const lines = $$('line', svg);

  const preload = ['living-teal-sofa', 'stair-leaf-panels', 'dining-vanity', 'bedroom-grey', 'kitchen-l-shape', 'bath-stone-wc', 'exterior-corner'].map(k => IMG(k, true));
  let loaded = 0;
  const prog = { v: 0 };
  const num = $('.loader__num');
  const loadTargets = preload.map(src => new Promise(res => {
    const im = new Image(); im.onload = im.onerror = () => { loaded++; res(); }; im.src = src;
  }));
  const fontsP = document.fonts ? document.fonts.ready : Promise.resolve();

  const drawTl = gsap.timeline();
  drawTl.to(lines, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: { each: 0.035, from: 'start' } });
  const counter = gsap.to(prog, {
    v: 100, duration: 2.4, ease: 'power2.inOut', paused: false,
    onUpdate: () => { num.textContent = String(Math.round(Math.min(prog.v, 25 + loaded / preload.length * 75))).padStart(3, '0'); }
  });

  Promise.all([Promise.all(loadTargets), fontsP, new Promise(r => setTimeout(r, reduce ? 200 : 2500))]).then(() => {
    num.textContent = '100';
    counter.kill();
    intro();
  });

  /* ------------------------------------------------------------------ */
  /* Intro                                                               */
  /* ------------------------------------------------------------------ */
  function intro() {
    const tl = gsap.timeline({
      onComplete: () => {
        $('.loader').remove();
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }
    });
    tl.to('.loader__inner', { opacity: 0, y: -30, duration: 0.6, ease: 'power3.in' })
      .to('.loader__panel--1', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .to('.loader__panel--2', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
      .add(() => window.Hero3D && Hero3D.build(), '<0.1')
      .from('.hero__word', { yPercent: 115, rotate: 4, duration: 1.4, ease: 'expo.out', stagger: 0.12, onComplete: () => $('.hero__title').classList.add('is-revealed') }, '<0.35')
      .from(['.hero .eyebrow', '.hero__lead', '.hero__actions', '.hero__caption', '.hero__corner', '.hero__scroll'], { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.08 }, '<0.3')
      .add(() => document.querySelector('.nav').classList.add('is-in'), '<');
  }

  /* ------------------------------------------------------------------ */
  /* Cursor + magnetic                                                   */
  /* ------------------------------------------------------------------ */
  if (fine) {
    const cur = $('.cursor'), dot = $('.cursor-dot'), label = $('.cursor__label');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, ring = { x: pos.x, y: pos.y };
    const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
    const setRing = { x: gsap.quickSetter(cur, 'x', 'px'), y: gsap.quickSetter(cur, 'y', 'px') };
    window.addEventListener('pointermove', e => { pos.x = e.clientX; pos.y = e.clientY; setDot.x(pos.x); setDot.y(pos.y); }, { passive: true });
    gsap.ticker.add(() => {
      ring.x += (pos.x - ring.x) * 0.18; ring.y += (pos.y - ring.y) * 0.18;
      setRing.x(ring.x); setRing.y(ring.y);
    });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor], a, button');
      cur.classList.toggle('is-paper', !!e.target.closest('.drawings'));
      if (t && t.dataset.cursor) { label.textContent = t.dataset.cursor; cur.classList.add('is-label'); cur.classList.remove('is-hover'); }
      else if (t) { cur.classList.add('is-hover'); cur.classList.remove('is-label'); }
      else { cur.classList.remove('is-hover', 'is-label'); }
    });
    document.addEventListener('pointerdown', () => gsap.to(cur, { scale: 0.8, duration: 0.2 }));
    document.addEventListener('pointerup', () => gsap.to(cur, { scale: 1, duration: 0.4, ease: 'back.out(3)' }));

    $$('[data-magnetic]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nav: links, menu, hide on scroll, active section                    */
  /* ------------------------------------------------------------------ */
  const body = document.body;
  const burger = $('.nav__burger');
  burger.addEventListener('click', () => {
    const open = !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
    lockScroll(open);
    if (open) gsap.from('.menu__links a', { yPercent: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    if (body.classList.contains('menu-open')) {
      body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); lockScroll(false);
    }
    scrollTo(id);
  });

  const nav = $('.nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 60);
      nav.classList.toggle('is-hidden', y > 400 && y > lastY && !body.classList.contains('menu-open'));
      lastY = y;
      gsap.set('.progress span', { scaleX: self.progress });
    }
  });
  ['work', 'drawings', 'archive', 'about', 'contact'].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 50%', end: 'bottom 50%', onToggle: s => link && link.classList.toggle('is-active', s.isActive) });
  });

  /* ------------------------------------------------------------------ */
  /* Hero scroll-out                                                      */
  /* ------------------------------------------------------------------ */
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: s => window.Hero3D && Hero3D.setScroll(s.progress)
  });
  if (!reduce) {
    gsap.to('.hero__content', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });
    gsap.to('#hero3d', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------------ */
  /* Marquee — velocity-reactive                                          */
  /* ------------------------------------------------------------------ */
  $$('.marquee__row').forEach(row => {
    const track = $('.marquee__track', row);
    for (let i = 0; i < 2; i++) row.appendChild(track.cloneNode(true));
    const tracks = $$('.marquee__track', row);
    const dir = +row.dataset.dir;
    let x = 0, boost = 0, w = tracks[0].offsetWidth;
    // cache the track width instead of reading layout every frame
    new ResizeObserver(() => (w = tracks[0].offsetWidth)).observe(tracks[0]);
    gsap.ticker.add((t, dt) => {
      if (!w) return;
      const v = lenis ? lenis.velocity : 0;
      boost += (Math.abs(v) * 0.12 - boost) * 0.1;
      x -= dir * (0.045 + boost * 0.02) * dt * (reduce ? 0 : 1);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      tracks.forEach(tr => (tr.style.transform = `translate3d(${x}px,0,0) skewX(${-Math.max(-8, Math.min(8, v * 0.25)) * dir}deg)`));
    });
  });

  /* ------------------------------------------------------------------ */
  /* Text reveals                                                         */
  /* ------------------------------------------------------------------ */
  document.fonts && document.fonts.ready.then(setupText);
  if (!document.fonts) setupText();
  function setupText() {
    $$('.split-lines').forEach(el => {
      const split = new SplitText(el, { type: 'lines', linesClass: 'sl-line', mask: 'lines' });
      if (reduce) return;
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // statement: word-by-word opacity scrub
    const st = $('.statement');
    const words = new SplitText(st, { type: 'words', wordsClass: 'w' }).words;
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });

    // contact title
    gsap.from('.contact__line > span', {
      yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.contact__title', start: 'top 85%' }
    });
    ScrollTrigger.refresh();
  }

  // counters
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, pad = +el.dataset.pad || 0, o = { v: end > 1000 ? end - 40 : 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(pad, '0')) })
    });
  });

  // generic fade-ups
  if (!reduce) {
    $$('.reveal-up, .stat, .tl, .plan, .tool, .skills__cols > div, .contact__grid > *, .mat').forEach(el => {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Work — pinned horizontal scroll (desktop) / stacked (mobile)         */
  /* ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const track = $('.work__track');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.work', pin: '.work__pin', start: 'top top', end: () => '+=' + dist(),
        scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => gsap.set('.work__progress span', { scaleX: s.progress })
      }
    });
    gsap.to('.work__head', { x: () => -innerWidth * 0.25, opacity: 0.12, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top top', end: () => '+=' + innerWidth * 0.7, scrub: true } });
    $$('.card').forEach(card => {
      const img = $('img', card);
      gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
  });
  // card reveals: IntersectionObserver sees the real (transformed) position in both layouts
  if (!reduce) {
    const wide = () => innerWidth > 860;
    $$('.card__media').forEach(m => gsap.set(m, { clipPath: wide() ? 'inset(0% 0% 0% 100%)' : 'inset(100% 0% 0% 0%)' }));
    const cardIO = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      // observe the card, not the clipped media: IO treats a fully clipped target as not intersecting
      gsap.to($('.card__media', en.target), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay: 0.1 });
      cardIO.unobserve(en.target);
    }), { threshold: 0.15 });
    $$('.card').forEach(c => cardIO.observe(c));
  }

  /* ------------------------------------------------------------------ */
  /* Exterior window reveal                                               */
  /* ------------------------------------------------------------------ */
  mm.add('(min-width: 601px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.window', pin: '.window__pin', start: 'top top', end: '+=120%', scrub: 1 } });
    tl.to('.window__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' }, 0)
      .to('.window__frame img', { scale: 1, ease: 'power2.inOut' }, 0)
      .from('.window__text', { y: 80, opacity: 0, ease: 'power2.out', duration: 0.5 }, 0.45)
      .from('.window__note', { opacity: 0, duration: 0.3 }, 0.6);
  });
  mm.add('(max-width: 600px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.window', pin: '.window__pin', start: 'top top', end: '+=90%', scrub: 1 } });
    tl.to('.window__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' }, 0)
      .to('.window__frame img', { scale: 1, ease: 'power2.inOut' }, 0);
  });

  /* ------------------------------------------------------------------ */
  /* Archive parallax + entrance                                          */
  /* ------------------------------------------------------------------ */
  if (!reduce) {
    ScrollTrigger.batch('.tile', {
      start: 'top 92%', once: true,
      onEnter: b => gsap.from(b, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07 })
    });
  }

  /* ------------------------------------------------------------------ */
  /* Timeline line                                                        */
  /* ------------------------------------------------------------------ */
  gsap.to('.timeline__line span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: true } });
  $$('.tl').forEach(t => ScrollTrigger.create({ trigger: t, start: 'top 70%', onToggle: s => t.classList.toggle('is-on', s.isActive || s.progress > 0), end: 'max' }));

  /* ------------------------------------------------------------------ */
  /* Contact bg parallax                                                  */
  /* ------------------------------------------------------------------ */
  if (!reduce) gsap.fromTo('.contact__bg img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', scrub: true } });

  /* ------------------------------------------------------------------ */
  /* Tool cards tilt                                                      */
  /* ------------------------------------------------------------------ */
  if (fine) $$('[data-tilt]').forEach(el => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 16); ry((px - 0.5) * 16);
      el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* ------------------------------------------------------------------ */
  /* Drawings: lens + paper/blueprint toggle                              */
  /* ------------------------------------------------------------------ */
  $$('.plan__sheet').forEach(sheet => {
    const img = $('img', sheet), lens = $('.plan__lens', sheet);
    const Z = 3.2;
    let fullLoaded = false;
    sheet.addEventListener('pointerenter', () => {
      if (fullLoaded) return;
      fullLoaded = true;
      lens.style.backgroundImage = `url(${img.dataset.full})`;
    });
    sheet.addEventListener('pointermove', e => {
      const r = sheet.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      lens.style.left = x + 'px'; lens.style.top = y + 'px';
      const ix = e.clientX - ir.left, iy = e.clientY - ir.top;
      lens.style.backgroundSize = `${ir.width * Z}px ${ir.height * Z}px`;
      lens.style.backgroundPosition = `${-ix * Z + 95}px ${-iy * Z + 95}px`;
    });
  });
  const toggle = $('.toggle'), pill = $('.toggle__pill');
  const placePill = b => { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  requestAnimationFrame(() => placePill($('.toggle__btn.is-active')));
  window.addEventListener('resize', () => placePill($('.toggle__btn.is-active')));
  toggle.addEventListener('click', e => {
    const b = e.target.closest('.toggle__btn');
    if (!b) return;
    $$('.toggle__btn', toggle).forEach(x => x.classList.toggle('is-active', x === b));
    placePill(b);
    $('.drawings').classList.toggle('is-blueprint', b.dataset.mode === 'blueprint');
  });

  /* ------------------------------------------------------------------ */
  /* Lightbox                                                             */
  /* ------------------------------------------------------------------ */
  const lb = $('.lightbox'), lbImg = $('.lightbox__stage img');
  let lbItems = [], lbIndex = 0, zoomed = false;
  function lbShow(i, instant) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    const it = lbItems[lbIndex];
    setZoom(false);
    const swap = () => {
      lbImg.src = it.src; lbImg.alt = it.cap;
      $('.lightbox__cap').textContent = it.cap;
      $('.lightbox__count').textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
      lb.classList.toggle('is-plan', !!it.plan);
      lbImg.decode ? lbImg.decode().catch(() => {}).then(() => gsap.to(lbImg, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' })) : gsap.set(lbImg, { opacity: 1 });
    };
    if (instant) { gsap.set(lbImg, { opacity: 0, scale: 0.96 }); swap(); }
    else gsap.to(lbImg, { opacity: 0, scale: 0.97, duration: 0.2, onComplete: swap });
    const multi = lbItems.length > 1;
    $$('.lightbox__btn').forEach(b => (b.style.display = multi ? '' : 'none'));
  }
  function lbOpen(items, i) {
    lbItems = items;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    lbShow(i, true);
  }
  function lbClose() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    if (!panel.classList.contains('is-open')) lockScroll(false);
  }
  function setZoom(on, e) {
    zoomed = on;
    lb.classList.toggle('is-zoomed', on);
    if (!on) { lbImg.style.transform = ''; return; }
    lbImg.style.transform = 'scale(2.6)';
    if (e) panZoom(e);
  }
  function panZoom(e) {
    const r = lbImg.parentElement.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    lbImg.style.transformOrigin = `${px * 100}% ${py * 100}%`;
  }
  lbImg.addEventListener('click', e => setZoom(!zoomed, e));
  lb.addEventListener('pointermove', e => zoomed && panZoom(e));
  $('.lightbox__prev').addEventListener('click', () => lbShow(lbIndex - 1));
  $('.lightbox__next').addEventListener('click', () => lbShow(lbIndex + 1));
  $('.lightbox__close').addEventListener('click', lbClose);
  $('.lightbox__stage').addEventListener('click', e => { if (e.target === e.currentTarget) lbClose(); });
  let touchX = null;
  lb.addEventListener('touchstart', e => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null || zoomed) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // archive tiles → lightbox over the currently visible set
  grid.addEventListener('click', e => {
    const t = e.target.closest('.tile');
    if (!t) return;
    const visible = $$('.tile:not(.is-hidden)', grid);
    const items = visible.map(v => { const a = ARCHIVE[+v.dataset.index]; return { src: IMG(a[0]), cap: `${a[2]} — ${a[1]}` }; });
    lbOpen(items, visible.indexOf(t));
  });
  // plans → lightbox
  const planItems = $$('.plan').map(p => ({ src: $('img', p).dataset.full, cap: $('.plan__title', p).textContent + ' — ' + $('.plan__block strong:nth-of-type(1)', p).textContent, plan: true }));
  $$('.plan').forEach((p, i) => {
    planItems[i].cap = `${$('.plan__title', p).textContent} · ${$$('.plan__block strong', p)[1].textContent}`;
    $('.plan__sheet', p).addEventListener('click', () => lbOpen(planItems, i));
  });

  /* ------------------------------------------------------------------ */
  /* Project panel                                                        */
  /* ------------------------------------------------------------------ */
  const panel = $('.panel'), pScroll = $('.panel__scroll');
  let current = null;
  function fillPanel(key) {
    const p = PROJECTS[key];
    current = key;
    $('.panel__hero img').src = IMG(p.images[0]);
    $('.panel__hero img').alt = p.plain;
    $('.panel__num').textContent = `Project ${p.num} / 07`;
    $('.panel__title').innerHTML = p.title;
    $('.panel__meta').innerHTML = p.meta.map(([k, v]) => `<div><span class="mono">${k}</span><strong>${v}</strong></div>`).join('');
    $('.panel__desc').textContent = p.desc;
    $('.panel__highlights').innerHTML = p.highlights.map(h => `<li>${h}</li>`).join('');
    const gal = p.images.slice(1);
    // odd counts lead with one full-width view; even counts sit in pairs
    const pair = gal.length % 2 === 0 ? 'pair' : '';
    $('.panel__gallery').innerHTML = gal.map((k, i) =>
      `<figure class="${pair}" data-cursor="Zoom"><img src="${IMG(k)}" alt="${p.plain} — view ${i + 2}" loading="lazy"></figure>`).join('');
    const order = PROJECT_ORDER, next = order[(order.indexOf(key) + 1) % order.length];
    $('.panel__next strong').innerHTML = PROJECTS[next].title;
    $('.panel__next').dataset.next = next;
    pScroll.scrollTop = 0;
  }
  function openPanel(key) {
    fillPanel(key);
    panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    const tl = gsap.timeline();
    tl.fromTo(pScroll, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
      .fromTo('.panel__hero img', { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.3)
      .fromTo(['.panel__num', '.panel__title', '.panel__meta', '.panel__body'], { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.55)
      .fromTo('.panel__close', { scale: 0 }, { scale: 1, duration: 0.8, ease: 'back.out(2)' }, 0.7);
    observeGallery();
  }
  function closePanel() {
    gsap.to(pScroll, {
      clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut',
      onComplete: () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); lockScroll(false); }
    });
  }
  function observeGallery() {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      gsap.fromTo(en.target, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' });
      io.unobserve(en.target);
    }), { root: pScroll, threshold: 0.1 });
    $$('.panel__gallery figure').forEach(f => { gsap.set(f, { opacity: 0 }); io.observe(f); });
  }
  $$('.card').forEach(c => {
    c.setAttribute('tabindex', '0');
    c.setAttribute('role', 'button');
    c.addEventListener('click', () => openPanel(c.dataset.project));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(c.dataset.project); } });
  });
  $('.panel__close').addEventListener('click', closePanel);
  $('.panel__next').addEventListener('click', () => {
    const next = $('.panel__next').dataset.next;
    gsap.to(pScroll, {
      opacity: 0, duration: 0.4, onComplete: () => {
        fillPanel(next);
        gsap.to(pScroll, { opacity: 1, duration: 0.5 });
        gsap.fromTo(['.panel__title', '.panel__meta', '.panel__body'], { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.07 });
        observeGallery();
      }
    });
  });
  $('.panel__gallery').addEventListener('click', e => {
    const f = e.target.closest('figure');
    if (!f) return;
    const p = PROJECTS[current];
    const items = p.images.map((k, i) => ({ src: IMG(k), cap: `${p.plain} — ${String(i + 1).padStart(2, '0')}` }));
    lbOpen(items, $$('.panel__gallery figure').indexOf(f) + 1);
  });
  $('.panel__hero').addEventListener('click', () => {
    const p = PROJECTS[current];
    lbOpen(p.images.map((k, i) => ({ src: IMG(k), cap: `${p.plain} — ${String(i + 1).padStart(2, '0')}` })), 0);
  });

  /* ------------------------------------------------------------------ */
  /* Keyboard                                                             */
  /* ------------------------------------------------------------------ */
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      return;
    }
    if (panel.classList.contains('is-open') && e.key === 'Escape') closePanel();
    if (body.classList.contains('menu-open') && e.key === 'Escape') burger.click();
  });

  /* ------------------------------------------------------------------ */
  /* Footer clock (IST)                                                   */
  /* ------------------------------------------------------------------ */
  const clock = $('[data-clock]');
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
  };
  tick(); setInterval(tick, 30000);

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
