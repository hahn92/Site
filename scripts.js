// ============================================
//  HAHN — Neon Grid (variant A)
//  Optimised: rAF-batched mouse effects, paused
//  canvas, robust iOS counter.
// ============================================

(function () {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = document.getElementById('stage');
  if (!stage) return;
  stage.setAttribute('data-cursor', isCoarse ? 'off' : 'on');

  // ===== Hero reveal =====
  const hero = document.querySelector('.va-hero');
  const h1 = hero && hero.querySelector('h1.va-h1');
  if (hero) {
    hero.classList.add('pre');
    if (h1) h1.classList.add('pre');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hero.classList.remove('pre');
      if (h1) h1.classList.remove('pre');
    }));
    setTimeout(() => {
      hero.classList.remove('pre');
      if (h1) h1.classList.remove('pre');
    }, 2500);
  }

  // ===== Coalesced global mouse handler =====
  // Single source of truth for cursor X/Y — every dependent effect reads
  // from it inside one rAF tick instead of registering its own listener.
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
  const orb1 = document.querySelector('.va-orb-1');
  const orb2 = document.querySelector('.va-orb-2');
  const cur = document.getElementById('va-cursor');
  const ring = document.getElementById('va-cursor-ring');

  let rx = mouse.x, ry = mouse.y;
  let pending = false;
  let ringAnim = null;

  function applyMouse() {
    pending = false;
    const w = window.innerWidth, h = window.innerHeight;
    const nx = (mouse.x / w - 0.5) * 2;
    const ny = (mouse.y / h - 0.5) * 2;
    if (orb1) orb1.style.transform = `translate3d(${nx * 40}px, ${ny * 40}px, 0)`;
    if (orb2) orb2.style.transform = `translate3d(${-nx * 30}px, ${-ny * 30}px, 0)`;
    if (cur) cur.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    if (ring && !ringAnim) ringAnim = requestAnimationFrame(ringLoop);
  }
  function ringLoop() {
    rx += (mouse.x - rx) * 0.18;
    ry += (mouse.y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    if (Math.abs(mouse.x - rx) > 0.4 || Math.abs(mouse.y - ry) > 0.4) {
      ringAnim = requestAnimationFrame(ringLoop);
    } else {
      ringAnim = null;
    }
  }

  if (!isCoarse) {
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (!pending) {
        pending = true;
        requestAnimationFrame(applyMouse);
      }
    }, { passive: true });

    if (cur && ring) {
      const hoverSel = 'a, button, .va-proj, .va-stack-item, .va-hobby';
      document.querySelectorAll(hoverSel).forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
      });
      window.addEventListener('mousedown', () => ring.classList.add('click'));
      window.addEventListener('mouseup', () => ring.classList.remove('click'));
    }
  }

  // ===== Canvas blobs (desktop only, paused offscreen) =====
  const canvas = document.getElementById('va-canvas');
  if (canvas && !isCoarse && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    // Gradients are inherently blurry — high DPR doubles the cost for
    // no perceptible quality gain. Pin to 1.
    const DPR = 1;
    let W = 0, H = 0;
    function resize() {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: W * 0.3, y: H * 0.3, r: 280, vx: 0.6, vy: 0.4, c: '96,165,250', phase: 0 },
      { x: W * 0.7, y: H * 0.4, r: 340, vx: -0.5, vy: 0.7, c: '167,139,250', phase: 2 },
      { x: W * 0.5, y: H * 0.7, r: 300, vx: 0.4, vy: -0.5, c: '139,92,246', phase: 4 },
      { x: W * 0.2, y: H * 0.8, r: 260, vx: 0.7, vy: -0.3, c: '59,130,246', phase: 1 }
    ];
    let smoothX = W / 2, smoothY = H / 2;
    let t = 0, animId = null;
    let heroVisible = true, docVisible = true;

    function draw() {
      smoothX += (mouse.x * DPR - smoothX) * 0.06;
      smoothY += (mouse.y * DPR - smoothY) * 0.06;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        b.x += b.vx + Math.sin(t * 0.5 + b.phase) * 0.3;
        b.y += b.vy + Math.cos(t * 0.4 + b.phase) * 0.3;
        b.x += (smoothX - b.x) * 0.002;
        b.y += (smoothY - b.y) * 0.002;
        if (b.x < -b.r) b.x = W + b.r;
        else if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        else if (b.y > H + b.r) b.y = -b.r;
        const pulseR = b.r + Math.sin(t + b.phase) * 40;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseR);
        g.addColorStop(0, `rgba(${b.c},0.32)`);
        g.addColorStop(0.5, `rgba(${b.c},0.07)`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      t += 0.01;
      animId = requestAnimationFrame(draw);
    }
    function start() { if (!animId && heroVisible && docVisible) animId = requestAnimationFrame(draw); }
    function stop() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
    start();

    document.addEventListener('visibilitychange', () => {
      docVisible = !document.hidden;
      if (docVisible) start(); else stop();
    });
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => {
        heroVisible = es[0].isIntersecting;
        if (heroVisible) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    }
  } else if (canvas) {
    canvas.style.display = 'none';
  }

  // ===== rAF-throttled per-element hover effects =====
  function rafThrottle(handler) {
    let frame = null, lastE = null;
    return function (e) {
      lastE = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        handler.call(this, lastE);
      });
    };
  }

  if (!isCoarse) {
    document.querySelectorAll('.va-proj').forEach(card => {
      card.addEventListener('mousemove', rafThrottle(function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
      }), { passive: true });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    document.querySelectorAll('.va-stack-item').forEach(el => {
      el.addEventListener('mousemove', rafThrottle(function (e) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      }), { passive: true });
    });

    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', rafThrottle(function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      }), { passive: true });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ===== Side dots nav + scroll spy =====
  const sections = document.querySelectorAll('[data-section]');
  const dots = document.querySelectorAll('.va-dot');
  dots.forEach(d => d.addEventListener('click', () => {
    const target = document.querySelector(`[data-section="${d.dataset.target}"]`);
    if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  }));
  if (sections.length && 'IntersectionObserver' in window) {
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.dataset.section;
          dots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => dotObs.observe(s));
  }

  // ===== Count-up (robust on iOS Safari) =====
  // Strategy: prime each element to "0", then trigger via three layers of
  // safety — immediate (if in viewport), IntersectionObserver, and a hard
  // 2s timeout. iOS Safari sometimes drops the initial IO callback for
  // elements that are already in the viewport at observe time.
  function startCount(el) {
    if (el._counted) return;
    el._counted = true;
    const target = +el.dataset.count;
    const t0 = performance.now();
    const dur = 1400;
    function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }
  function inViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  document.querySelectorAll('[data-count]').forEach(el => {
    el.textContent = '0';
    if (inViewport(el)) {
      setTimeout(() => startCount(el), 200);
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        if (es[0].isIntersecting) { startCount(el); io.disconnect(); }
      }, { threshold: 0.1 });
      io.observe(el);
    }
    setTimeout(() => startCount(el), 2000);
  });

  // ===== Smooth-scroll nav anchors =====
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  });
})();
