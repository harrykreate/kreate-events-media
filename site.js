(() => {
  const $ = s => document.querySelector(s);
  /* motion: respect a device's reduce-motion setting by default, but let the visitor choose to play it */
  const kfe = window.__kfe || (window.__kfe = { errs: [] });
  const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionPref = /[?&]motion=on\b/.test(location.search) ? 'on' : /[?&]motion=off\b/.test(location.search) ? 'off' : null;
  try { if (motionPref) localStorage.setItem('kfe-motion', motionPref); else motionPref = localStorage.getItem('kfe-motion'); } catch (e) {}
  const reduce = osReduce && motionPref !== 'on';
  document.documentElement.classList.toggle('motion-on', !reduce);
  kfe.motion = reduce ? 'OFF (device asks for reduced motion)' : osReduce ? 'on (visitor chose to play)' : 'on';
  if (osReduce) {
    const pill = document.createElement('button');
    pill.type = 'button'; pill.className = 'motion-pill' + (reduce ? '' : ' is-playing');
    pill.textContent = reduce ? '\u25B6 Play motion' : '\u275A\u275A Pause motion';
    pill.setAttribute('aria-label', reduce ? 'Your device is set to reduce motion. Play the animations anyway.' : 'Pause the animations.');
    pill.addEventListener('click', () => {
      const next = reduce ? 'on' : 'off';
      try { localStorage.setItem('kfe-motion', next); } catch (e) {}
      location.replace(location.pathname + '?motion=' + next);
    });
    (document.querySelector('.hero-copy') || document.body).prepend(pill);
  }
  const small = matchMedia('(max-width: 900px)').matches;
  let heroOn = true; // phones: is the hero on screen (pauses its canvas + pendulum work when it is not)

  /* ---------- content ---------- */
  const creatives = ['ai-everything-1','automechanika-1','achema-1','aquaflame-1','securika-1','mitt-1','transrussia-1','ai-everything-4','automechanika-2','achema-2','moshome-1','mosbuild-1','yugagro-1','weldex-1','ai-everything-2','analitika-1','pharmtech-1','fastenex-1','automechanika-4','achema-3','aquaflame-2','securika-2','mitt-2','miningworld-1','dairytech-1','ai-everything-5','automechanika-3','ai-everything-3'];
  const shows = [
    { name: 'AI Everything', city: 'Abu Dhabi · Cairo', line: 'Social campaign bringing ideas, people and sectors to life.', imgs: ['ai-everything-4','ai-everything-1','ai-everything-5'] },
    { name: 'Automechanika Riyadh', city: 'Riyadh', line: 'Show-specific assets with a clear identity and human focus.', imgs: ['automechanika-2','automechanika-1','automechanika-4'] },
    { name: 'ACHEMA Middle East', city: 'Riyadh', line: 'Visitor and exhibitor creative for the process industries.', imgs: ['achema-2','achema-1','achema-3'] },
    { name: 'Securika Moscow', city: 'Moscow', line: 'Campaign creative across formats for a security show.', imgs: ['securika-2','securika-1','weldex-1'] },
    { name: 'Aquaflame', city: 'Moscow', line: 'A consistent look from launch posts to onsite materials.', imgs: ['aquaflame-2','aquaflame-1','analitika-1'] },
    { name: 'MITT & TransRussia', city: 'Moscow', line: 'Travel and logistics shows, one production rhythm.', imgs: ['mitt-2','mitt-1','transrussia-1'] },
    { name: 'MosBuild & MosHome', city: 'Moscow', line: 'Building and interiors campaigns for exhibitors and visitors.', imgs: ['moshome-1','mosbuild-1','fastenex-1'] },
    { name: 'On the floor', city: 'Lagos · Dubai', line: 'Onsite with the teams at Big 5 Construct Nigeria, INDEX and GITEX.', imgs: ['../ph/big5-nigeria','../ph/index-dubai','../ph/gitex'] },
  ];
  const board = [
    ['K1','AI Everything','Abu Dhabi'],['K2','Automechanika','Riyadh'],['K3','ACHEMA Middle East','Riyadh'],['K4','Big 5 Construct','Lagos'],
    ['K5','INDEX','Dubai'],['K6','Securika','Moscow'],['K7','TransRussia','Moscow'],['K8','MosBuild','Moscow'],['K9','Aquaflame','Moscow']
  ];
  const logos = ['adibs-abu-dhabi-international-boat-show','adife-abu-dhabi-international-food-exhib','adihex-2024','adnec-group','ai-everything','awief','idex-navdex','capital-events','global-media-congress','isnr','big-5-construct-south-africa','big-5-construct-nigeria','big-5-construct-kenya','big-5-construct-ethiopia','big-5-construct-qatar','the-hotel-show','leisure-show','kidspace','workspace','index','index-design-qatar','the-coatings-group','asia-pacific-coatings-show','middle-east-coatings-show','saudi-arabia-coatings-show','coatings-for-africa','saudi-entertainment-and-amusement'];
  const logoName = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  /* media wall */
  const wall = $('#wall');
  for (let c = 0; c < 9; c++) {
    const col = document.createElement('div'); col.className = 'wall-col';
    const set = []; for (let k = 0; k < 6; k++) set.push(creatives[(c * 5 + k * 3) % creatives.length]);
    [...set, ...set].forEach(n => { const im = new Image(); im.src = `https://cdn.jsdelivr.net/gh/harrykreate/kreate-events-media@8665078cabca12e234af9e02521216c325d481b0/img/cr/${n}.webp`; im.alt = ''; im.loading = small ? 'eager' : 'lazy'; im.decoding = 'async'; col.appendChild(im); });
    wall.appendChild(col);
  }
  /* halls */
  $('#hallTrack').innerHTML = shows.map((s, i) => `
    <article class="stand">
      <div class="stand-no">Hall ${String(i + 1).padStart(2, '0')} · ${s.city}</div>
      <h3>${s.name}</h3><p>${s.line}</p>
      <div class="fan">${s.imgs.map(n => `<img src="https://cdn.jsdelivr.net/gh/harrykreate/kreate-events-media@8665078cabca12e234af9e02521216c325d481b0/img/cr/${n}.webp" alt="${s.name} creative" loading="lazy">`).join('')}</div>
    </article>`).join('');
  /* board */
  const flap = (txt, n, cls = '') => `<span class="flap ${cls}" data-text="${txt.toUpperCase()}">${[...txt.toUpperCase().padEnd(n)].slice(0, n).map(ch => `<b class="${ch === ' ' ? 'sp' : ''}">${ch === ' ' ? '' : ch}</b>`).join('')}</span>`;
  $('#boardRows').innerHTML = board.map(([h, s, c], i) => `<div class="board-row" role="row" style="--r:${i + 1}"><span role="cell">${flap(h, 2, 'amber')}</span><span role="cell">${flap(s, 18)}</span><span role="cell">${flap(c, 9)}</span><span role="cell" class="live">Created</span></div>`).join('');
  /* logos */
  $('#logos').innerHTML = logos.map(s => `<li><img src="https://cdn.jsdelivr.net/gh/harrykreate/kreate-events-media@8665078cabca12e234af9e02521216c325d481b0/img/logo/${s}-white.webp" alt="${logoName(s)}" loading="lazy"></li>`).join('');

  /* ---------- draggable all-access badge (spring pendulum) ---------- */
  const badge = $('#badge'), strap = $('#strap'), card = $('#badgeCard');
  let ang = 0, vel = 0, dragging = false, lastX = 0, target = 0;
  const pivotLen = small ? 170 : 270;
  const swing = () => {
    if (small && !heroOn) return requestAnimationFrame(swing);
    if (!dragging) { vel += (-ang * 0.022); vel *= 0.965; ang += vel; }
    badge.style.transform = `rotate(${ang}deg)`;
    strap.style.transform = `rotate(${ang * 0.92}deg)`;
    card.style.setProperty('--holo', `${ang * 9 + 120}deg`);
    requestAnimationFrame(swing);
  };
  if (!reduce) {
    ang = -14; requestAnimationFrame(swing);
    badge.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; badge.setPointerCapture(e.pointerId); badge.style.cursor = 'grabbing'; });
    badge.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      const prev = ang; ang = Math.max(-55, Math.min(55, ang - dx * 0.35)); vel = ang - prev;
    });
    const up = () => { dragging = false; badge.style.cursor = 'grab'; };
    badge.addEventListener('pointerup', up); badge.addEventListener('pointercancel', up);
    addEventListener('mousemove', e => { if (!dragging) vel += (e.movementX || 0) * -0.004; }, { passive: true });
  }

  /* ---------- spotlight beams ---------- */
  const beams = $('#beams'), bx = beams.getContext('2d');
  let mx = .7, my = .3;
  const fit = () => { const r = beams.getBoundingClientRect(); beams.width = r.width; beams.height = r.height; };
  fit(); addEventListener('resize', fit);
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
  const drawBeams = t => {
    if (small && !heroOn) return requestAnimationFrame(drawBeams);
    const w = beams.width, h = beams.height; bx.clearRect(0, 0, w, h);
    const lights = [{ x: .12, hue: 'rgba(160,127,206,', s: 0.0006 }, { x: .88, hue: 'rgba(79,192,189,', s: 0.0005 }, { x: .5, hue: 'rgba(251,191,36,', s: 0.0004 }];
    lights.forEach((L, i) => {
      const sway = Math.sin(t * L.s + i * 2) * 0.18;
      const tx = (mx * 0.6 + 0.2 + sway) * w, ty = (0.75 + my * 0.2) * h;
      const sx = L.x * w, sy = -40;
      const ang = Math.atan2(ty - sy, tx - sx), len = Math.hypot(tx - sx, ty - sy) * 1.3, spread = 0.13;
      const g = bx.createLinearGradient(sx, sy, tx, ty);
      g.addColorStop(0, L.hue + (i === 2 ? '.16)' : '.30)')); g.addColorStop(1, L.hue + '0)');
      bx.fillStyle = g; bx.beginPath(); bx.moveTo(sx, sy);
      bx.lineTo(sx + Math.cos(ang - spread) * len, sy + Math.sin(ang - spread) * len);
      bx.lineTo(sx + Math.cos(ang + spread) * len, sy + Math.sin(ang + spread) * len); bx.closePath(); bx.fill();
    });
    if (!reduce) requestAnimationFrame(drawBeams);
  };
  requestAnimationFrame(drawBeams);

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

  /* ---------- doors-open countdown ---------- */
  const doorsLed = $('#doorsLed');
  const startSite = () => {
    if (reduce || !window.gsap) { document.querySelector('.doors')?.remove(); return boot(); }
    const counts = ['3', '2', '1', 'OPEN'];
    let k = 0;
    const tick = () => {
      dotText(doorsLed, [counts[k]], { size: 220, step: 10, color: k === 3 ? 'rgba(79,192,189,1)' : 'rgba(251,191,36,1)' });
      k++;
      if (k < counts.length) setTimeout(tick, 380);
      else setTimeout(() => {
        gsap.timeline({ onComplete: () => { document.querySelector('.doors')?.remove(); } })
          .to('.doors-inner', { opacity: 0, scale: 1.1, duration: .4 })
          .to('.doors-panel', { yPercent: -100, duration: .95, ease: 'expo.inOut', stagger: .08 }, '-=.1')
          .add(boot, '-=.6');
      }, 420);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
  };

  /* ---------- scroll choreography ---------- */
  function boot() {
    if (small && !reduce) phoneBase();
    if (!window.gsap || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    kfe.booted = true;
    if (small) phoneMotion();
    let lenis;
    if (window.Lenis && !small) {
      lenis = new Lenis({ lerp: .09 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const el = $(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); });
    }
    gsap.from('.hero-copy > *', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08 });
    gsap.from('.badge-rig', { y: -400, duration: 1.6, ease: 'elastic.out(1,.55)', delay: .2 });

    if (!small) {
      /* hero: camera flies into the media wall */
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .6 } })
        .to('.wall', { transform: 'perspective(1400px) rotateX(0deg) rotateZ(0deg) scale(1.6)', opacity: .9, ease: 'none' }, 0)
        .to('.hero-copy', { y: -140, opacity: 0, ease: 'none' }, 0)
        .to('.badge-rig', { y: -300, opacity: 0, ease: 'none' }, 0)
        .to('.veil', { opacity: .4, ease: 'none' }, 0);

      /* halls: horizontal walk */
      const track = $('#hallTrack');
      gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
        scrollTrigger: { trigger: '.halls', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true, onUpdate: s => $('#hallRail').style.setProperty('--p', s.progress) } });

      /* services: active item follows scroll */
      const items = [...document.querySelectorAll('.svc-item')], shots = [...document.querySelectorAll('.svc-shot')];
      ScrollTrigger.create({ trigger: '.svc', start: 'top top', end: 'bottom bottom', onUpdate: s => {
        const i = Math.min(items.length - 1, Math.floor(s.progress * items.length));
        items.forEach((el, k) => el.classList.toggle('on', k === i)); shots.forEach((el, k) => el.classList.toggle('on', k === i));
      } });
    }

    /* departures board: flaps shuffle into place */
    ScrollTrigger.create({ trigger: '.board', start: 'top 75%', once: true, onEnter: () => {
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·';
      if (small) { // phones: one clock for every flap, rows start one after the other, and only the page on show shuffles
        const cells = [];
        document.querySelectorAll('#boardRows .board-row').forEach((rowEl, row) => rowEl.querySelectorAll('.flap').forEach((f, col) => {
          if (col > 1) return;
          f.querySelectorAll('b').forEach((b, i) => { const final = f.dataset.text[i] || ''; if (final.trim()) cells.push({ b, final, n: -row, max: 5 + ((i * 3 + row * 2) % 8) }); });
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
        return;
      }
      document.querySelectorAll('.board .flap').forEach((f, row) => {
        const target = f.dataset.text; const cells = [...f.querySelectorAll('b')];
        cells.forEach((b, i) => {
          const final = target[i] || ''; if (!final.trim()) return;
          let n = 0, max = 6 + ((i * 3 + row * 2) % 9);
          const iv = setInterval(() => { b.textContent = n >= max ? final : A[(Math.random() * A.length) | 0]; if (n++ >= max) clearInterval(iv); }, 55);
        });
      });
    } });

    /* LED statement */
    const led = $('#ledDots'), heading = $('#ledHeading');
    const paintLed = () => {
      const r = led.parentElement.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      led.width = r.width * dpr; led.height = r.height * dpr;
      const hb = heading.getBoundingClientRect(), fs = parseFloat(getComputedStyle(heading).fontSize) * dpr, lh = parseFloat(getComputedStyle(heading).lineHeight) * dpr || fs;
      dotText(led, ['ONE CREW.', 'EVERY FORMAT.', 'EVERY EDITION.'], { size: fs, top: (hb.top - r.top) * dpr - (lh - fs) / 2, step: Math.max(5, Math.round(fs / 16)) });
    };
    paintLed(); ScrollTrigger.addEventListener('refresh', paintLed);
    gsap.timeline({ scrollTrigger: { trigger: '.led', start: 'top top', end: 'bottom bottom', scrub: .6 } })
      .fromTo(led, { scale: 4.5 }, { scale: 1, ease: 'power2.out', duration: 1 })
      .fromTo('.led-copy h2', { opacity: 0 }, { opacity: 1, duration: .2 }, .85)
      .to(led, { opacity: 0, duration: .2 }, .9)
      .fromTo('.led-copy p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .2 }, .95)
      .to({}, { duration: .3 });

    /* process line fills */
    gsap.fromTo('#steps', { '--fill': 0 }, { '--fill': 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 80%', end: 'bottom 50%', scrub: true } });
    if (!small) gsap.from('.logos img', { y: 40, opacity: 0, scale: .9, duration: .8, ease: 'expo.out', stagger: .03, scrollTrigger: { trigger: '.logos', start: 'top 85%' } });
    if (!small) gsap.from('.stagefloor h2', { scale: 1.3, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.stagefloor', start: 'top 80%', end: 'center center', scrub: true } });
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- phones: everything plays by itself ---------- */
  const watch = (el, fn, threshold = .1, rootMargin = '0px') => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) return fn(true);
    new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), { threshold, rootMargin }).observe(el);
  };

  /* the stage reel loads only when it is about to be seen, and rests when it is not */
  const reel = $('.stagefloor video');
  watch(reel, on => {
    if (on && !reel.getAttribute('src') && reel.dataset.src) reel.src = reel.dataset.src;
    if (on) { const p = reel.play(); p && p.catch(() => {}); } else if (!reel.paused) reel.pause();
  }, 0, '60% 0px');

  function phoneBase() { // CSS-driven motion only needs to know what is on screen
    const hero = $('.hero');
    watch(hero, on => { heroOn = on; hero.classList.toggle('live', on); }, .04);
    const boardEl = $('.board');
    watch(boardEl, on => boardEl.classList.toggle('run', on), .5);
    /* the pass sways a little as the page moves */
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (heroOn && !dragging) vel += Math.max(-1.1, Math.min(1.1, dy * .012));
    }, { passive: true });
    /* in-page links glide */
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const el = $(a.getAttribute('href')); if (!el) return;
      e.preventDefault();
      scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY), behavior: 'smooth' });
    });
  }

  function phoneMotion() {
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* HALLS: story-style carousel. Each show holds, the bar fills, then it glides to the next. */
    const halls = $('.halls'), track = $('#hallTrack'), stands = [...track.querySelectorAll('.stand')];
    const prog = document.createElement('div'); prog.className = 'hall-prog'; prog.setAttribute('aria-hidden', 'true');
    prog.innerHTML = stands.map(() => '<i><b></b></i>').join('');
    track.before(prog);
    const segs = [...prog.querySelectorAll('b')];
    const DWELL = 3.4;
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
      settleT = setTimeout(() => { // a swipe settled: whichever show is closest becomes current
        const x = track.scrollLeft; let best = 0, bd = Infinity;
        stands.forEach((s, k) => { const d = Math.abs(leftOf(k) - x); if (d < bd) { bd = d; best = k; } });
        if (best !== idx) setIdx(best);
      }, 110);
    }, { passive: true });
    watch(track, on => { inView = on; }, .55);

    /* SERVICES: one card pops up after the other; the one you are reading lights up */
    const cards = gsap.utils.toArray('.svc-item');
    cards.forEach(el => el.classList.remove('on'));
    let svcSeen = false, svcTick = 0;
    const lightCard = () => { // whichever card sits on the reading line is the lit one
      svcTick = 0; const y = innerHeight * .56;
      cards.forEach(el => { const r = el.getBoundingClientRect(); el.classList.toggle('on', r.top <= y && r.bottom > y); });
    };
    watch($('.svc'), on => { svcSeen = on; if (on) lightCard(); }, 0);
    addEventListener('scroll', () => { if (svcSeen && !svcTick) svcTick = requestAnimationFrame(lightCard); }, { passive: true });
    gsap.set('.svc-word', { opacity: 0, x: -34 });
    gsap.set(cards, { opacity: 0, y: 64, scale: .93 });
    ScrollTrigger.create({ trigger: '.svc-word', start: 'top 88%', once: true, onEnter: () => gsap.to('.svc-word', { opacity: 1, x: 0, duration: 1, ease: 'expo.out' }) });
    ScrollTrigger.batch(cards, { start: 'top 90%', once: true, interval: .12, onEnter: els => {
      gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: .95, ease: 'back.out(1.5)', stagger: .2, clearProps: 'transform', onComplete: () => lightCard() });
      els.forEach((el, i) => gsap.from(el.querySelectorAll('li'), { opacity: 0, x: -14, duration: .5, ease: 'power2.out', stagger: .07, delay: .35 + i * .2 }));
    } });

    /* PROCESS: steps arrive in order */
    const stepEls = gsap.utils.toArray('#steps li');
    gsap.set(stepEls, { opacity: 0, x: 26 });
    ScrollTrigger.batch(stepEls, { start: 'top 86%', once: true, interval: .12, onEnter: els => gsap.to(els, { opacity: 1, x: 0, duration: .8, ease: 'power3.out', stagger: .18, clearProps: 'transform' }) });

    /* LOGO WALL: tiles land, then lights travel across them */
    const lg = $('#logos'), tiles = [...lg.children].filter(li => getComputedStyle(li).display !== 'none');
    tiles.forEach((li, i) => {
      const r = Math.floor(i / 3), c = i % 3;
      li.style.setProperty('--t', (r * .85 + c * .4 + ((i * 7) % 5) * .12).toFixed(2) + 's');
      li.style.setProperty('--dur', (i % 2 ? 5.6 : 6.6) + 's');
    });
    lg.classList.add('lights');
    gsap.set(tiles, { opacity: 0, y: 26, scale: .92 });
    ScrollTrigger.create({ trigger: lg, start: 'top 86%', once: true, onEnter: () => gsap.to(tiles, { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'power3.out', stagger: .045, clearProps: 'transform', onComplete: () => lg.classList.add('dance') }) });
    watch(lg, on => lg.classList.toggle('off', !on), .05);

    /* headings and blocks rise as they arrive */
    const rise = gsap.utils.toArray('.hall-sign > *, .hall-prog, .board-head > div > *, .board-head > p, .board, .stagefloor .copy > *, .process > .eyebrow, .process > h2, .process > p, .company > .eyebrow, .company > h2, .organisers, .faq > div:first-child > *, .faq details, .desk-grid > div:first-child > *, form.reg');
    gsap.set(rise, { opacity: 0, y: 28 });
    ScrollTrigger.batch(rise, { start: 'top 92%', once: true, interval: .1, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .85, ease: 'power3.out', stagger: .09, clearProps: 'transform' }) });
  }

  /* ---------- registration desk ---------- */
  const reg = $('#reg'), ticket = $('#ticket');
  reg.addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#f-hp').value) return;
    const name = $('#f-name').value.trim(), email = $('#f-email').value.trim(), ev = $('#f-event').value.trim();
    if (!name || !email || !ev || !$('#f-email').checkValidity()) { reg.reportValidity(); return; }
    const help = $('#f-help').value, time = $('#f-time').value.trim();
    const id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + 'abcdefghij').slice(0, 36);
    let saved = false;
    try { const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, person: name, email, event: ev, help, notes: time, company_website: '' }) }); saved = r.ok; } catch {}
    $('#tTitle').textContent = `${ev}: pass ready.`;
    $('#tBody').textContent = `${name}, here's your brief: ${help.toLowerCase()}${time ? `, ${time}` : ''}. Continue on WhatsApp and Harry will come back with a starting scope.`;
    $('#tCode').textContent = 'KFE-' + String(Math.abs([...ev].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 900 + 100);
    const body = `Name: ${name}\nWork email: ${email}\nEvent: ${ev}\nWhere can we help: ${help}\nTimeline and priorities: ${time || '-'}`;
    $('#tWa').href = `https://wa.me/918281888333?text=${encodeURIComponent('Hi Harry, ' + body)}`;
    $('#tMail').href = `mailto:harry@kreativeclan.com?subject=${encodeURIComponent('Event enquiry: ' + ev)}&body=${encodeURIComponent(body)}`;
    $('#tNote').textContent = saved ? 'Your enquiry is saved. Harry will reply on WhatsApp or email.' : 'We could not save the form just now. Please send it on WhatsApp or email so it reaches Harry.';
    reg.style.display = 'none'; ticket.classList.add('on');
  });
  startSite();
})();
