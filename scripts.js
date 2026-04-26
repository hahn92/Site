// ============================================
//  SHARED — cursor, magnetism, reveal utilities
// ============================================

(function(){
  const root = document.documentElement;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // Variant switcher — persistent
  const stage = document.getElementById('stage');
  const variantButtons = document.querySelectorAll('[data-set-variant]');
  const savedVariant = localStorage.getItem('hahn-variant') || 'a';
  function setVariant(v){
    stage.setAttribute('data-variant', v);
    stage.setAttribute('data-cursor', isCoarse ? 'off' : 'on');
    localStorage.setItem('hahn-variant', v);
    variantButtons.forEach(b => b.classList.toggle('active', b.dataset.setVariant === v));
    document.querySelectorAll('.variant-scope').forEach(el => {
      el.style.display = el.dataset.forVariant === v ? '' : 'none';
    });
    window.scrollTo({top: 0, behavior: 'instant'});
    setTimeout(initForVariant, 50);
  }
  variantButtons.forEach(b => b.addEventListener('click', () => setVariant(b.dataset.setVariant)));
  setVariant(savedVariant);

  // ============================================
  //  VARIANT A — Neon Grid
  // ============================================
  function initVariantA(){
    // Hero reveal — simple fade+translate, always ends visible
    const heroA = document.querySelector('[data-variant="a"] .va-hero');
    const h1A = document.querySelector('[data-variant="a"] .va-hero h1.va-h1');
    if (heroA) {
      heroA.classList.add('pre');
      if (h1A) h1A.classList.add('pre');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroA.classList.remove('pre');
          if (h1A) h1A.classList.remove('pre');
        });
      });
      setTimeout(() => {
        heroA.classList.remove('pre');
        if (h1A) h1A.classList.remove('pre');
      }, 2500);
    }

    // Grid canvas with cursor influence — skip on touch devices
    const canvas = document.getElementById('va-canvas');
    if (canvas && !isCoarse) {
      const ctx = canvas.getContext('2d');
      let W = 0, H = 0;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      function resize(){
        W = canvas.width = window.innerWidth * DPR;
        H = canvas.height = window.innerHeight * DPR;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
      }
      resize();
      window.addEventListener('resize', resize);

      const mouse = { x: -9999, y: -9999 };
      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX * DPR;
        mouse.y = e.clientY * DPR;
      });

      const mouseSoft = { x: W/2, y: H/2, tx: W/2, ty: H/2 };
      window.addEventListener('mousemove', e => {
        mouseSoft.tx = e.clientX * DPR;
        mouseSoft.ty = e.clientY * DPR;
      });
      const blobs = [
        { x: W*0.3, y: H*0.3, r: 280*DPR, vx: 0.6, vy: 0.4, c: [96,165,250], phase: 0 },
        { x: W*0.7, y: H*0.4, r: 340*DPR, vx: -0.5, vy: 0.7, c: [167,139,250], phase: 2 },
        { x: W*0.5, y: H*0.7, r: 300*DPR, vx: 0.4, vy: -0.5, c: [139,92,246], phase: 4 },
        { x: W*0.2, y: H*0.8, r: 260*DPR, vx: 0.7, vy: -0.3, c: [59,130,246], phase: 1 },
      ];
      let t = 0, animId;
      function draw(){
        mouseSoft.x += (mouseSoft.tx - mouseSoft.x) * 0.06;
        mouseSoft.y += (mouseSoft.ty - mouseSoft.y) * 0.06;
        ctx.clearRect(0,0,W,H);
        ctx.globalCompositeOperation = 'lighter';
        blobs.forEach(b => {
          b.x += b.vx + Math.sin(t * 0.5 + b.phase) * 0.3;
          b.y += b.vy + Math.cos(t * 0.4 + b.phase) * 0.3;
          const dx = mouseSoft.x - b.x;
          const dy = mouseSoft.y - b.y;
          b.x += dx * 0.002;
          b.y += dy * 0.002;
          if (b.x < -b.r) b.x = W + b.r;
          if (b.x > W + b.r) b.x = -b.r;
          if (b.y < -b.r) b.y = H + b.r;
          if (b.y > H + b.r) b.y = -b.r;
          const pulseR = b.r + Math.sin(t + b.phase) * 40 * DPR;
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseR);
          g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.32)`);
          g.addColorStop(0.5, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.07)`);
          g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(b.x, b.y, pulseR, 0, Math.PI*2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
        t += 0.01;
        animId = requestAnimationFrame(draw);
      }
      animId = requestAnimationFrame(draw);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
        else if (!animId) { animId = requestAnimationFrame(draw); }
      });
    } else if (canvas) {
      canvas.style.display = 'none';
    }

    // Custom cursor
    const cur = document.getElementById('va-cursor');
    const ring = document.getElementById('va-cursor-ring');
    if (!isCoarse && cur && ring) {
      let rx = 0, ry = 0, tx = 0, ty = 0;
      window.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        cur.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      });
      function loop(){
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      }
      loop();

      document.querySelectorAll('[data-variant="a"] a, [data-variant="a"] button, [data-variant="a"] .va-proj, [data-variant="a"] .va-stack-item, [data-variant="a"] .va-hobby')
        .forEach(el => {
          el.addEventListener('mouseenter', () => ring.classList.add('hover'));
          el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
      window.addEventListener('mousedown', () => ring.classList.add('click'));
      window.addEventListener('mouseup', () => ring.classList.remove('click'));
    }

    // Orb parallax
    const orb1 = document.querySelector('[data-variant="a"] .va-orb-1');
    const orb2 = document.querySelector('[data-variant="a"] .va-orb-2');
    window.addEventListener('mousemove', e => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (orb1) orb1.style.transform = `translate(${mx * 40}px, ${my * 40}px)`;
      if (orb2) orb2.style.transform = `translate(${-mx * 30}px, ${-my * 30}px)`;
    });

    // Tilt on project cards
    document.querySelectorAll('[data-variant="a"] .va-proj').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Stack radial gradient follow
    document.querySelectorAll('[data-variant="a"] .va-stack-item').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });

    // Side dots nav + scroll spy
    const sections = document.querySelectorAll('[data-variant="a"] [data-section]');
    const dots = document.querySelectorAll('[data-variant="a"] .va-dot');
    dots.forEach(d => d.addEventListener('click', () => {
      const target = document.querySelector(`[data-variant="a"] [data-section="${d.dataset.target}"]`);
      if (target) window.scrollTo({top: target.offsetTop - 80, behavior: 'smooth'});
    }));
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const id = e.target.dataset.section;
          dots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => dotObs.observe(s));

    // Magnetic buttons
    document.querySelectorAll('[data-variant="a"] [data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // Count-up
    document.querySelectorAll('[data-variant="a"] [data-count]').forEach(el => {
      const target = +el.dataset.count;
      let started = false;
      function runCount() {
        if (started) return;
        started = true;
        const t0 = performance.now();
        const dur = 1400;
        function step(now){
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toString();
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      const io = new IntersectionObserver(es => {
        if (es[0].isIntersecting) runCount();
      }, { threshold: 0.1 });
      io.observe(el);
      // Safari iOS fallback: IO may not fire for elements already in viewport
      setTimeout(runCount, 1000);
    });
  }

  // ============================================
  //  VARIANT B — Liquid Flow
  // ============================================
  function initVariantB(){
    // Hero reveal — JS-driven
    const heroB = document.querySelector('[data-variant="b"] .vb-hero');
    if (heroB) {
      heroB.classList.add('pre');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroB.classList.remove('pre');
          heroB.classList.add('in');
        });
      });
      setTimeout(() => {
        heroB.classList.remove('pre');
        heroB.classList.add('in');
      }, 2500);
    }

    const canvas = document.getElementById('vb-blobs');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    function resize(){
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: W/2, y: H/2, tx: W/2, ty: H/2 };
    window.addEventListener('mousemove', e => {
      mouse.tx = e.clientX * DPR;
      mouse.ty = e.clientY * DPR;
    });

    const blobs = [
      { x: W*0.3, y: H*0.3, r: 280*DPR, vx: 0.6, vy: 0.4, c: [96,165,250], phase: 0 },
      { x: W*0.7, y: H*0.4, r: 340*DPR, vx: -0.5, vy: 0.7, c: [167,139,250], phase: 2 },
      { x: W*0.5, y: H*0.7, r: 300*DPR, vx: 0.4, vy: -0.5, c: [244,114,182], phase: 4 },
      { x: W*0.2, y: H*0.8, r: 260*DPR, vx: 0.7, vy: -0.3, c: [59,130,246], phase: 1 },
    ];

    let t = 0;
    function draw(){
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation = 'lighter';

      blobs.forEach((b, i) => {
        // drift + pulled toward mouse slightly
        b.x += b.vx + Math.sin(t * 0.5 + b.phase) * 0.3;
        b.y += b.vy + Math.cos(t * 0.4 + b.phase) * 0.3;
        const dx = mouse.x - b.x;
        const dy = mouse.y - b.y;
        b.x += dx * 0.002;
        b.y += dy * 0.002;

        if (b.x < -b.r) b.x = W + b.r;
        if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        if (b.y > H + b.r) b.y = -b.r;

        const pulseR = b.r + Math.sin(t + b.phase) * 40 * DPR;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pulseR);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.38)`);
        g.addColorStop(0.5, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.08)`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulseR, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      t += 0.01;
      requestAnimationFrame(draw);
    }
    draw();

    // Liquid cursor
    const c1 = document.getElementById('vb-cursor');
    const c2 = document.getElementById('vb-cursor-dot');
    if (!isCoarse && c1 && c2){
      let rx=0,ry=0,tx=0,ty=0;
      window.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        c2.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      });
      function loop(){
        rx += (tx - rx) * 0.14;
        ry += (ty - ry) * 0.14;
        c1.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      }
      loop();
      document.querySelectorAll('[data-variant="b"] a, [data-variant="b"] button, [data-variant="b"] .vb-proj')
        .forEach(el => {
          el.addEventListener('mouseenter', () => c1.classList.add('hover'));
          el.addEventListener('mouseleave', () => c1.classList.remove('hover'));
        });
    }

    // Progress bar
    const bar = document.querySelector('[data-variant="b"] .vb-progress');
    if (bar){
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        bar.style.width = (p * 100) + '%';
      };
      window.addEventListener('scroll', onScroll, {passive: true});
      onScroll();
    }

    // Projects horizontal scroll
    const scroller = document.querySelector('[data-variant="b"] .vb-projects');
    const progBar = document.querySelector('[data-variant="b"] .vb-scroll-progress-bar');
    const countEl = document.querySelector('[data-variant="b"] .vb-scroll-count b');
    const prevBtn = document.querySelector('[data-variant="b"] .vb-arrow-prev');
    const nextBtn = document.querySelector('[data-variant="b"] .vb-arrow-next');
    if (scroller){
      const items = scroller.querySelectorAll('.vb-proj');
      const updateScrollUI = () => {
        const sl = scroller.scrollLeft;
        const max = scroller.scrollWidth - scroller.clientWidth;
        const p = max > 0 ? sl / max : 0;
        if (progBar) progBar.style.width = Math.max(10, p * 100) + '%';
        // find the closest snap item
        let closest = 0, minDist = Infinity;
        items.forEach((item, i) => {
          const d = Math.abs(item.offsetLeft - sl - 40);
          if (d < minDist){ minDist = d; closest = i; }
        });
        if (countEl) countEl.textContent = String(closest + 1).padStart(2,'0');
      };
      scroller.addEventListener('scroll', updateScrollUI, {passive: true});
      updateScrollUI();
      const scrollBy = dir => {
        const step = Math.min(620, window.innerWidth * 0.7);
        scroller.scrollBy({left: dir * step, behavior: 'smooth'});
      };
      if (prevBtn) prevBtn.addEventListener('click', () => scrollBy(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => scrollBy(1));
    }

    // Line reveal on scroll for interests + exp rows
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, {threshold: 0.15});
    document.querySelectorAll('[data-variant="b"] .vb-reveal').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(0.2,0.9,0.3,1), transform 0.9s cubic-bezier(0.2,0.9,0.3,1)';
      io.observe(el);
    });

    // Count up on stats
    document.querySelectorAll('[data-variant="b"] [data-count]').forEach(el => {
      const target = +el.dataset.count;
      let started = false;
      const countIo = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting && !started){
            started = true;
            const t0 = performance.now(), dur = 1600;
            function step(now){
              const p = Math.min(1, (now - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased).toString();
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          }
        });
      }, {threshold: 0.4});
      countIo.observe(el);
    });
  }

  // Smooth-scroll nav anchors (both variants)
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

  function initForVariant(){
    const v = stage.getAttribute('data-variant');
    if (v === 'a') initVariantA();
    else initVariantB();
  }

})();
