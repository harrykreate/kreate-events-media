/* The Kreative Clan team page. Same script as the Kreate for Events site (doors, media wall, pass, beams,
   halls, split-flap board, LED, stage reel, phone choreography), fed with the team list in people.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, kc = window.__kc || (window.__kc = { errs: [] });

  /* motion: respect a device's reduce-motion setting by default, but let the visitor choose to play it */
  const KEY = 'kc-team-motion';
  const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionPref = null;
  try { motionPref = localStorage.getItem(KEY); } catch (e) {}
  let reduce = osReduce && motionPref !== 'on';
  root.classList.toggle('motion-on', !reduce);
  const small = matchMedia('(max-width: 900px)').matches;
  let heroOn = true; // is the hero on screen (pauses its canvas, pendulum and pass when it is not)
  let lenis = null;

  /* ---------- the people: built in content.js, and already in the page's HTML when it was pre-rendered ---------- */
  const D = window.CLAN, V = window.CLAN_VIEW(D, new Date());
  const { people, order, counts, TEAMS } = V;
  const put = (el, k) => { if (el && el.dataset.sig !== V.sig[k]) { el.innerHTML = V.html[k]; el.dataset.sig = V.sig[k]; } };
  $$('[data-count]').forEach(n => { const v = counts[n.dataset.count]; if (v != null && n.textContent !== String(v)) n.textContent = v; });
  if ($('#asOf').textContent !== V.asOf) $('#asOf').textContent = V.asOf;

  /* ---------- motion button ---------- */
  let pill = null;
  const pillState = () => {
    pill.className = 'motion-pill' + (reduce ? '' : ' is-playing');
    pill.textContent = reduce ? '▶ Play motion' : '❚❚ Pause motion';
    pill.setAttribute('aria-label', reduce ? 'Your device is set to reduce motion. Play the animations anyway.' : 'Pause the animations.');
  };
  if (osReduce) {
    pill = document.createElement('button'); pill.type = 'button'; pillState();
    pill.addEventListener('click', () => {
      if (reduce) { // start everything in place
        try { localStorage.setItem(KEY, 'on'); } catch (e) {}
        reduce = false; root.classList.add('motion-on'); pillState(); startMotion();
      } else { // back to the still page
        try { localStorage.setItem(KEY, 'off'); } catch (e) {}
        location.reload();
        setTimeout(() => { // the frame would not reload: stop in place instead
          reduce = true; root.classList.remove('motion-on'); pillState();
          if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
          if (window.gsap) gsap.globalTimeline.clear();
          if (lenis) { lenis.destroy(); lenis = null; }
          if (!reel.paused) reel.pause();
        }, 1500);
      }
    });
    $('.hero-copy').prepend(pill);
  }

  /* ---------- content ---------- */
  /* media wall: team and office photos, mixed with portraits */
  const photos = ['the-clan', 'gitex', 'onam', 'founders', 'big5-nigeria', 'office-nights', 'index-dubai', 'foosball-2021b', 'tedx', 'beginning', 'gitex-room', 'desk-2021', 'foosball-2021a', 'beanbag-2021'];
  const faces = people.filter(p => p.photo);
  const tiles = [];
  for (let i = 0; i < Math.max(photos.length, faces.length); i++) {
    if (photos[i]) tiles.push({ src: `img/years/${photos[i]}.webp` });
    if (faces[i]) tiles.push({ src: `img/people/${faces[i].photo}.webp`, cls: 'face' + (faces[i].founder ? ' cut' : '') });
  }
  const wall = $('#wall');
  for (let c = 0; c < 9; c++) {
    const col = document.createElement('div'); col.className = 'wall-col';
    const set = []; for (let k = 0; k < 6; k++) set.push(tiles[(c * 5 + k * 4) % tiles.length]);
    [...set, ...set].forEach(t => { const im = new Image(); im.src = t.src; im.alt = ''; if (t.cls) im.className = t.cls; im.loading = small ? 'eager' : 'lazy'; im.decoding = 'async'; col.appendChild(im); });
    wall.appendChild(col);
  }

  /* story, roster and cards */
  put($('#hallTrack'), 'stands');
  put($('#boardRows'), 'board');
  put($('#founders'), 'founders');
  put($('#members'), 'members');
  const chips = $('#chips'), teamLine = $('#teamLine');
  put(chips, 'chips');
  const applyTeam = t => {
    $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.team === t)));
    $$('.founder, .member').forEach(c => { c.hidden = !!t && c.dataset.team !== t; });
    $('#founders').hidden = !$$('.founder').some(c => !c.hidden);
    $('#members').hidden = !$$('.member').some(c => !c.hidden);
    const tm = TEAMS.find(x => x[0] === t);
    teamLine.textContent = tm ? tm[1] : 'Everyone, founders first, then longest-standing first.';
    if (window.ScrollTrigger && kc.booted) ScrollTrigger.refresh();
  };
  chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) applyTeam(c.dataset.team); });
  applyTeam('');

  /* photo strip: a second copy makes the loop seamless */
  const strip = $('#strip');
  $$('figure', strip).forEach(f => { const d = f.cloneNode(true); d.setAttribute('data-dup', ''); d.setAttribute('aria-hidden', 'true'); strip.appendChild(d); });

  /* in-page links glide */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY), behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- draggable crew pass (spring pendulum). It shows one of the Clan at a time. ---------- */
  const badge = $('#badge'), strap = $('#strap'), card = $('#badgeCard');
  const passName = $('#passName'), passRole = $('#passRole'), passCode = $('#passCode');
  const passes = [{ n: 'The Clan', r: `${people.length} people · Kreative Clan`, c: `Est. ${D.founded}` }].concat(order.map(p => ({ n: p.name, r: p.role, c: p.since })));
  const showPass = k => {
    const s = passes[k % passes.length];
    passName.textContent = s.n; passRole.textContent = s.r; passCode.textContent = s.c;
    passName.style.fontSize = '';
    if (passName.scrollWidth > passName.clientWidth) passName.style.fontSize = Math.floor(parseFloat(getComputedStyle(passName).fontSize) * passName.clientWidth / passName.scrollWidth * 10) / 10 + 'px';
  };
  showPass(0);
  let passK = 0, passT = 0;
  const cyclePasses = () => {
    clearInterval(passT);
    passT = setInterval(() => {
      if (reduce || !heroOn || document.hidden || dragging) return;
      card.classList.add('swap');
      setTimeout(() => { showPass(++passK); card.classList.remove('swap'); }, 320);
    }, 2800);
  };
  let ang = 0, vel = 0, dragging = false, lastX = 0, swinging = false;
  const swing = () => {
    if (reduce) { swinging = false; return; }
    if (!heroOn) return requestAnimationFrame(swing);
    if (!dragging) { vel += (-ang * 0.022); vel *= 0.965; ang += vel; }
    badge.style.transform = `rotate(${ang}deg)`;
    strap.style.transform = `rotate(${ang * 0.92}deg)`;
    card.style.setProperty('--holo', `${ang * 9 + 120}deg`);
    requestAnimationFrame(swing);
  };
  badge.addEventListener('pointerdown', e => { if (reduce) return; dragging = true; lastX = e.clientX; badge.setPointerCapture(e.pointerId); badge.style.cursor = 'grabbing'; });
  badge.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    const prev = ang; ang = Math.max(-55, Math.min(55, ang - dx * 0.35)); vel = ang - prev;
  });
  const up = () => { dragging = false; badge.style.cursor = 'grab'; };
  badge.addEventListener('pointerup', up); badge.addEventListener('pointercancel', up);
  addEventListener('mousemove', e => { if (!dragging && !reduce) vel += (e.movementX || 0) * -0.004; }, { passive: true });
  const startPass = () => { if (!swinging) { swinging = true; ang = -14; requestAnimationFrame(swing); } cyclePasses(); };

  /* ---------- spotlight beams ---------- */
  const beams = $('#beams'), bx = beams.getContext('2d');
  let mx = .7, my = .3, beaming = false;
  const fit = () => { const r = beams.getBoundingClientRect(); beams.width = r.width; beams.height = r.height; if (reduce) drawBeams(0); };
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
  function drawBeams(t) {
    if (!reduce && !heroOn) return requestAnimationFrame(drawBeams);
    const w = beams.width, h = beams.height; bx.clearRect(0, 0, w, h);
    const lights = [{ x: .12, hue: 'rgba(160,127,206,', s: 0.0006 }, { x: .88, hue: 'rgba(79,192,189,', s: 0.0005 }, { x: .5, hue: 'rgba(251,191,36,', s: 0.0004 }];
    lights.forEach((L, i) => {
      const sway = Math.sin(t * L.s + i * 2) * 0.18;
      const tx = (mx * 0.6 + 0.2 + sway) * w, ty = (0.75 + my * 0.2) * h;
      const sx = L.x * w, sy = -40;
      const a = Math.atan2(ty - sy, tx - sx), len = Math.hypot(tx - sx, ty - sy) * 1.3, spread = 0.13;
      const g = bx.createLinearGradient(sx, sy, tx, ty);
      g.addColorStop(0, L.hue + (i === 2 ? '.16)' : '.30)')); g.addColorStop(1, L.hue + '0)');
      bx.fillStyle = g; bx.beginPath(); bx.moveTo(sx, sy);
      bx.lineTo(sx + Math.cos(a - spread) * len, sy + Math.sin(a - spread) * len);
      bx.lineTo(sx + Math.cos(a + spread) * len, sy + Math.sin(a + spread) * len); bx.closePath(); bx.fill();
    });
    if (!reduce) requestAnimationFrame(drawBeams); else beaming = false;
  }
  const startBeams = () => { if (!beaming) { beaming = true; requestAnimationFrame(drawBeams); } };
  fit(); addEventListener('resize', fit);
  beaming = true; requestAnimationFrame(drawBeams);

  /* ---------- LED dot text ---------- */
  function dotText(canvas, lines, opts = {}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d');
    o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
    const size = opts.size || H / (lines.length + .4);
    o.font = `700 ${size}px "Space Grotesk", sans-serif`;
    lines.forEach((l, i) => o.fillText(l, W / 2, (opts.top ?? (H - size * lines.length) / 2) + size * i + size / 2));
    const d = o.getImageData(0, 0, W, H).data; const step = opts.step || Math.max(4, Math.round(size / 14));
    ctx.clearRect(0, 0, W, H);
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      const lit = d[((y | 0) * W + (x | 0)) * 4 + 3] > 120;
      ctx.fillStyle = lit ? (opts.color || 'rgba(244,243,255,.95)') : 'rgba(244,243,255,.05)';
      ctx.beginPath(); ctx.arc(x, y, lit ? step * .38 : step * .2, 0, 7); ctx.fill();
    }
  }

  /* ---------- doors open: two, then the whole Clan ---------- */
  const doorsLed = $('#doorsLed'), doorsLabel = $('#doorsLabel');
  const startSite = () => {
    if (!reduce) startPass();
    if (reduce || !window.gsap) { $('.doors')?.remove(); return boot(); }
    const counts2 = [['2', 'Founded by two', 'rgba(251,191,36,1)'], [String(people.length), 'Grown by the Clan', 'rgba(79,192,189,1)']];
    let k = 0;
    const tick = () => {
      dotText(doorsLed, [counts2[k][0]], { size: 220, step: 10, color: counts2[k][2] });
      doorsLabel.textContent = counts2[k][1];
      k++;
      if (k < counts2.length) setTimeout(tick, 620);
      else setTimeout(() => {
        gsap.timeline({ onComplete: () => { $('.doors')?.remove(); } })
          .to('.doors-inner', { opacity: 0, scale: 1.1, duration: .4 })
          .to('.doors-panel', { yPercent: -100, duration: .95, ease: 'expo.inOut', stagger: .08 }, '-=.1')
          .add(boot, '-=.6');
      }, 640);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
  };
  /* the visitor pressed Play on a device that asks for reduced motion */
  const startMotion = () => { startPass(); startBeams(); boot(); if (reelOn) playReel(); };

  /* ---------- scroll choreography ---------- */
  let booted = false;
  function boot() {
    if (booted) return;
    if (small && !reduce) phoneBase();
    if (!window.gsap || reduce) return;
    booted = true;
    gsap.registerPlugin(ScrollTrigger);
    kc.booted = true;
    if (small) phoneMotion();
    if (window.Lenis && !small) {
      lenis = new Lenis({ lerp: .09 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    }
    gsap.from('.hero-copy > *', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08 });
    gsap.from('.badge-rig', { y: -400, duration: 1.6, ease: 'elastic.out(1,.55)', delay: .2 });

    if (!small) {
      /* hero: camera flies into the photo wall */
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .6 } })
        .to('.wall', { transform: 'perspective(1400px) rotateX(0deg) rotateZ(0deg) scale(1.6)', opacity: .9, ease: 'none' }, 0)
        .to('.hero-copy', { y: -140, opacity: 0, ease: 'none' }, 0)
        .to('.badge-rig', { y: -300, opacity: 0, ease: 'none' }, 0)
        .to('.veil', { opacity: .4, ease: 'none' }, 0);
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: s => { heroOn = s.isActive || scrollY < 10; } });

      /* halls: horizontal walk through the years */
      const track = $('#hallTrack');
      gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
        scrollTrigger: { trigger: '.halls', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true, onUpdate: s => $('#hallRail').style.setProperty('--p', s.progress) } });
    }

    /* roster board: flaps shuffle into place, one row after the other, on one clock */
    ScrollTrigger.create({ trigger: '.board', start: 'top 75%', once: true, onEnter: () => {
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·', cells = [];
      $$('#boardRows .board-row').forEach((rowEl, row) => $$('.flap', rowEl).forEach((f, col) => {
        if (small && col > 1) return; // phones: only the page on show shuffles
        $$('b', f).forEach((b, i) => { const final = f.dataset.text[i] || ''; if (final.trim()) cells.push({ b, final, n: -row, max: 5 + ((i * 3 + row * 2) % 8) }); });
      }));
      let live = cells.length;
      const iv = setInterval(() => {
        cells.forEach(c => {
          if (c.n > c.max) return;
          if (c.n >= 0) c.b.textContent = c.n === c.max ? c.final : A[(Math.random() * A.length) | 0];
          if (c.n++ === c.max) live--;
        });
        if (live <= 0) clearInterval(iv);
      }, 60);
    } });

    /* LED numbers */
    const led = $('#ledDots'), heading = $('#ledHeading');
    const paintLed = () => {
      const r = led.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      led.width = r.width * dpr; led.height = r.height * dpr;
      const hb = heading.getBoundingClientRect(), fs = parseFloat(getComputedStyle(heading).fontSize) * dpr, lh = parseFloat(getComputedStyle(heading).lineHeight) * dpr || fs;
      dotText(led, $$('span', heading).map(s => s.textContent.toUpperCase()), { size: fs, top: (hb.top - r.top) * dpr - (lh - fs) / 2, step: Math.max(5, Math.round(fs / 16)) });
    };
    paintLed(); ScrollTrigger.addEventListener('refresh', paintLed);
    gsap.timeline({ scrollTrigger: { trigger: '.led', start: 'top top', end: 'bottom bottom', scrub: .6 } })
      .fromTo(led, { scale: 4.5 }, { scale: 1, ease: 'power2.out', duration: 1 })
      .fromTo('.led-copy h2', { opacity: 0 }, { opacity: 1, duration: .2 }, .85)
      .to(led, { opacity: 0, duration: .2 }, .9)
      .fromTo('.led-copy p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .2 }, .95)
      .to({}, { duration: .3 });

    /* the Clan: cards land a row at a time */
    const cards = gsap.utils.toArray('.founder, .member');
    gsap.set(cards, { opacity: 0, y: 40, scale: .96 });
    ScrollTrigger.batch(cards, { start: 'top 92%', once: true, interval: .1, onEnter: els => gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'expo.out', stagger: .05, clearProps: 'transform' }) });
    if (!small) gsap.from('.stagefloor h2', { scale: 1.3, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.stagefloor', start: 'top 80%', end: 'center center', scrub: true } });
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- everything plays by itself, only while it is on screen ---------- */
  const watch = (el, fn, threshold = .1, rootMargin = '0px') => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) return fn(true);
    new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), { threshold, rootMargin }).observe(el);
  };

  /* the team reel loads only when it is about to be seen, and rests when it is not */
  const reel = $('.stagefloor video');
  let reelOn = false;
  const playReel = () => {
    if (!reel.getAttribute('src')) reel.src = (small && reel.dataset.srcM) || reel.dataset.src;
    const p = reel.play(); p && p.catch(() => {});
  };
  watch(reel, on => {
    reelOn = on;
    if (reduce) return;
    if (on) playReel(); else if (!reel.paused) reel.pause();
  }, 0, '60% 0px');

  function phoneBase() { // CSS-driven motion only needs to know what is on screen
    const hero = $('.hero');
    watch(hero, on => { heroOn = on; hero.classList.toggle('live', on); }, .04);
    const boardEl = $('.board');
    watch(boardEl, on => boardEl.classList.toggle('run', on), .2);
    /* the pass sways a little as the page moves */
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (heroOn && !dragging) vel += Math.max(-1.1, Math.min(1.1, dy * .012));
    }, { passive: true });
  }

  function phoneMotion() {
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* HALLS: story-style carousel. Each chapter holds, the bar fills, then it glides to the next. */
    const halls = $('.halls'), track = $('#hallTrack'), stands = $$('.stand', track);
    const prog = document.createElement('div'); prog.className = 'hall-prog'; prog.setAttribute('aria-hidden', 'true');
    prog.innerHTML = stands.map(() => '<i><b></b></i>').join('');
    track.before(prog);
    const segs = $$('b', prog);
    const DWELL = 4.6;
    let idx = 0, fill = 0, inView = false, held = false, glide = null, resumeT = 0, settleT = 0;
    const leftOf = i => Math.min(stands[i].offsetLeft - stands[0].offsetLeft, track.scrollWidth - track.clientWidth);
    const setIdx = i => {
      idx = i; fill = 0;
      segs.forEach((b, k) => { b.style.transform = `scaleX(${k < i ? 1 : 0})`; });
      stands.forEach((s, k) => s.classList.toggle('is-on', k === i));
    };
    const stopGlide = () => { if (glide) { glide.kill(); glide = null; track.style.scrollSnapType = ''; } };
    const go = i => {
      const n = (i + stands.length) % stands.length;
      setIdx(n); stopGlide();
      track.style.scrollSnapType = 'none'; // the browser must not fight the glide
      glide = gsap.to(track, { scrollLeft: leftOf(n), duration: n ? .95 : 1.3, ease: 'power3.inOut', onComplete: () => { glide = null; track.style.scrollSnapType = ''; } });
    };
    setIdx(0); halls.classList.add('auto');
    gsap.ticker.add((time, dt) => {
      if (!inView || held || glide || document.hidden) return;
      fill += Math.min(dt, 64) / 1000 / DWELL;
      if (fill >= 1) go(idx + 1); else segs[idx].style.transform = `scaleX(${fill})`;
    });
    const grab = () => { held = true; clearTimeout(resumeT); stopGlide(); };
    const release = () => { clearTimeout(resumeT); resumeT = setTimeout(() => { held = false; }, 2400); };
    track.addEventListener('touchstart', grab, { passive: true });
    track.addEventListener('touchend', release, { passive: true });
    track.addEventListener('touchcancel', release, { passive: true });
    track.addEventListener('mousedown', grab);
    addEventListener('mouseup', () => { if (held) release(); });
    track.addEventListener('wheel', () => { grab(); release(); }, { passive: true });
    track.addEventListener('scroll', () => {
      if (glide) return; // our own motion
      clearTimeout(settleT);
      settleT = setTimeout(() => { // a swipe settled: whichever chapter is closest becomes current
        const x = track.scrollLeft; let best = 0, bd = Infinity;
        stands.forEach((s, k) => { const d = Math.abs(leftOf(k) - x); if (d < bd) { bd = d; best = k; } });
        if (best !== idx) setIdx(best);
      }, 110);
    }, { passive: true });
    watch(track, on => { inView = on; }, .55);

    /* headings and blocks rise as they arrive */
    const rise = gsap.utils.toArray('.hall-sign > *, .hall-prog, .board-head > div > *, .board-head > p, .board, .clan > .eyebrow, .clan > h2, .chips, .team-line, .stagefloor .copy > *, .desk > *');
    gsap.set(rise, { opacity: 0, y: 28 });
    ScrollTrigger.batch(rise, { start: 'top 92%', once: true, interval: .1, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .85, ease: 'power3.out', stagger: .09, clearProps: 'transform' }) });
  }

  startSite();
})();
