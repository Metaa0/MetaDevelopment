// A lightweight, decorative motion layer. Content never depends on this file.
(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('[data-ambient-canvas]');
  const context = canvas.getContext('2d');
  const toggle = document.querySelector('[data-motion-toggle]');
  const label = document.querySelector('[data-motion-label]');
  const cursorHalo = document.querySelector('[data-cursor-halo]');
  const cursor = { x: 0, y: 0, targetX: 0, targetY: 0, visible: false };
  const hideCursor = () => {
    cursor.visible = false;
    cursorHalo.classList.remove('is-visible');
    root.classList.remove('custom-cursor-active');
  };
  const hero = document.querySelector('.hero');
  const heroPanel = document.querySelector('.hero-showcase');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const compact = matchMedia('(max-width: 620px)');
  let paused = false;
  try { paused = localStorage.getItem('meta-motion-paused') === 'true'; } catch {}
  let pageSuspended = false;
  let frame = 0;
  let scrollFrame = 0;
  let lastFrame = 0;
  let phase = 0;
  let width = 0;
  let height = 0;
  let scrollDepth = 0;
  let scrollDriver = null;
  const scenes = [...document.querySelectorAll('main > section')];
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const parallaxMedia = [...document.querySelectorAll('.about-visual img, .experience-media img')];
  const surfaces = [...document.querySelectorAll('.project-card, .proof-grid article, .skills-grid article, .pricing-grid article, .contact-form')];
  scenes.forEach(section => section.classList.add('scroll-section'));
  surfaces.forEach(surface => surface.classList.add('interactive-surface'));
  const pointer = { x: .7, y: .5, targetX: .7, targetY: .5 };
  const running = () => !paused && !reduced.matches && !document.hidden && !pageSuspended;

  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const color = root.style.getPropertyValue('--accent-rgb') || '187, 140, 255';
    const rows = compact.matches ? 14 : 20;
    const amplitude = compact.matches ? 22 : 42;
    const offset = Math.sin(scrollDepth * .38) * 24;
    const wave = (x, row) => {
      const base = height * .12 + (row / rows) * height;
      const bend = Math.exp(-Math.pow((x / width - pointer.x) * 3, 2));
      return base + Math.sin(x / width * 5 + phase + row * .26) * amplitude
        + Math.cos(x / width * 8 - phase * .5) * 12
        + bend * (pointer.y - .5) * 70 + offset;
    };
    context.lineWidth = .8;
    for (let row = 0; row < rows; row++) {
      context.strokeStyle = `rgba(${color}, ${row % 4 === 0 ? .2 : .085})`;
      context.beginPath();
      for (let x = -20; x <= width + 20; x += 24) {
        const y = wave(x, row);
        if (x === -20) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    // Sparse vertical connections give the field structure without a busy particle cloud.
    context.strokeStyle = `rgba(${color}, .055)`;
    for (let column = 0; column < 18; column++) {
      const x = column / 17 * width;
      context.beginPath();
      for (let row = 0; row < rows; row++) {
        const y = wave(x, row);
        if (row === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    // Short signals travel along the same paths; no product metrics are simulated.
    for (let index = 0; index < (compact.matches ? 5 : 9); index++) {
      const row = (index * 3 + 2) % rows;
      const x = ((phase * .045 + index * .137) % 1) * (width + 70) - 35;
      const y = wave(x, row);
      context.strokeStyle = `rgba(${color}, .55)`;
      context.lineWidth = 1.3;
      context.beginPath();
      context.moveTo(x - 28, wave(x - 28, row));
      context.lineTo(x, y);
      context.stroke();
      context.fillStyle = `rgba(${color}, .8)`;
      context.beginPath();
      context.arc(x, y, 1.8, 0, Math.PI * 2);
      context.fill();
    }
  };

  const tick = (now) => {
    frame = 0;
    if (!running()) return;
    scrollDriver?.raf(now);
    if (cursor.visible && finePointer.matches) {
      const follow = 1 - Math.exp(-Math.min(now - (cursor.lastTime || now), 64) / 45);
      cursor.x += (cursor.targetX - cursor.x) * follow;
      cursor.y += (cursor.targetY - cursor.y) * follow;
      cursorHalo.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
    }
    cursor.lastTime = now;
    const elapsed = now - lastFrame;
    if (elapsed >= 1000 / (compact.matches ? 24 : 30)) {
      phase += Math.min(elapsed, 70) * .00022;
      pointer.x += (pointer.targetX - pointer.x) * .045;
      pointer.y += (pointer.targetY - pointer.y) * .045;
      lastFrame = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  };

  const updateScroll = () => {
    scrollFrame = 0;
    scrollDepth = window.scrollY / Math.max(height, 1);
    const rect = hero.getBoundingClientRect();
    const depth = Math.max(0, Math.min(-rect.top / rect.height, 1));
    // A separate translate property leaves hover/selection transforms independent.
    heroPanel.style.translate = !running() || compact.matches ? 'none' : `0 ${-depth * 32}px`;
    // Read geometry in one pass, then write decorative properties. No layout is pinned.
    const sectionRects = scenes.map(section => section.getBoundingClientRect());
    const mediaRects = parallaxMedia.map(image => image.parentElement.getBoundingClientRect());
    scenes.forEach((section, index) => {
      const box = sectionRects[index];
      const progress = Math.max(0, Math.min((height - box.top) / (height + box.height), 1));
      if (running()) section.style.setProperty('--section-progress', progress.toFixed(3));
      section.classList.toggle('is-in-view', box.top < height && box.bottom > 0);
    });
    parallaxMedia.forEach((image, index) => {
      const box = mediaRects[index];
      const travel = Math.max(-1, Math.min((box.top + box.height / 2 - height / 2) / height, 1));
      image.style.translate = !running() || compact.matches ? 'none' : `0 ${travel * -28}px`;
    });
    const current = scenes.filter((section, index) => sectionRects[index].top <= height * .3
      && navLinks.some(link => link.hash === `#${section.id}`)).at(-1);
    navLinks.forEach(link => {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const syncScrollDriver = () => {
    const enabled = running() && finePointer.matches && !compact.matches && typeof window.Lenis === 'function';
    if (!enabled && scrollDriver) {
      scrollDriver.destroy();
      scrollDriver = null;
    }
    if (enabled && !scrollDriver) {
      scrollDriver = new window.Lenis({
        autoRaf: false,
        lerp: .16,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        prevent: node => node.matches?.('textarea, select, .site-nav, [data-lenis-prevent]'),
      });
    }
    root.dataset.scrollMode = scrollDriver ? 'smooth' : 'native';
  };

  const syncState = () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
    frame = 0;
    scrollFrame = 0;
    root.dataset.motion = reduced.matches ? 'reduced' : paused ? 'paused' : 'running';
    syncScrollDriver();
    if (!running() || !finePointer.matches) hideCursor();
    toggle.hidden = false;
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
    label.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Motion paused' : 'Motion on';
    if (!running()) {
      document.getAnimations().forEach(animation => animation.cancel());
      heroPanel.style.translate = 'none';
      parallaxMedia.forEach(image => { image.style.translate = 'none'; });
      surfaces.forEach(surface => surface.classList.remove('has-pointer'));
    } else {
      updateScroll();
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, compact.matches ? 1 : 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
    syncScrollDriver();
    scrollDriver?.resize();
    updateScroll();
  };

  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('meta-motion-paused', String(paused)); } catch {}
    syncState();
  });
  reduced.addEventListener('change', syncState);
  compact.addEventListener('change', resize);
  finePointer.addEventListener('change', syncState);
  document.addEventListener('visibilitychange', syncState);
  window.addEventListener('pagehide', () => { pageSuspended = true; syncState(); });
  window.addEventListener('pageshow', () => { pageSuspended = false; syncState(); });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') { hideCursor(); return; }
    if (!running() || !finePointer.matches) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) {
      hideCursor();
    } else {
      cursor.targetX = event.clientX;
      cursor.targetY = event.clientY;
      if (!cursor.visible) {
        cursor.x = event.clientX;
        cursor.y = event.clientY;
        cursorHalo.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
      }
      cursor.visible = true;
      cursorHalo.classList.add('is-visible');
      root.classList.add('custom-cursor-active');
      cursorHalo.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, summary')));
    }
    pointer.targetX = event.clientX / width;
    pointer.targetY = event.clientY / height;
  }, { passive: true });
  window.addEventListener('blur', hideCursor);
  document.addEventListener('pointerleave', () => {
    hideCursor();
    pointer.targetX = .7;
    pointer.targetY = .5;
  });

  // Keep hash history and keyboard focus while one controller owns interpolation.
  document.addEventListener('click', event => {
    if (!scrollDriver || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.target === '_blank') return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    // Keyboard paging and browser-native scrolling may have moved since the last tick.
    scrollDriver.scrollTo(window.scrollY, { immediate: true });
    scrollDriver.resize();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    scrollDriver.scrollTo(target, { lerp: .16, onComplete: () => {
      const hadTabindex = target.hasAttribute('tabindex');
      if (!hadTabindex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    } });
  });
  document.addEventListener('keydown', event => {
    hideCursor();
    if (['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp', 'Tab'].includes(event.key)) {
      scrollDriver?.scrollTo(window.scrollY, { immediate: true });
    }
  });
  window.addEventListener('popstate', () => {
    scrollDriver?.destroy();
    scrollDriver = null;
    requestAnimationFrame(() => { syncScrollDriver(); updateScroll(); });
  });

  // Pointer lighting is event-driven and never moves the click target.
  surfaces.forEach(surface => {
    surface.addEventListener('pointermove', event => {
      if (!running() || !finePointer.matches || event.pointerType === 'touch') return;
      const box = surface.getBoundingClientRect();
      surface.style.setProperty('--light-x', `${event.clientX - box.left}px`);
      surface.style.setProperty('--light-y', `${event.clientY - box.top}px`);
      surface.classList.add('has-pointer');
    }, { passive: true });
    surface.addEventListener('pointerleave', () => surface.classList.remove('has-pointer'));
  });
  document.querySelectorAll('.faq details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      scrollDriver?.resize();
      if (!detail.open || !running()) return;
      const answer = detail.querySelector('p');
      answer.getAnimations().forEach(animation => animation.cancel());
      answer.animate([{ opacity: .3, translate: '0 -8px' }, { opacity: 1, translate: '0 0' }], { duration: 260, easing: 'ease-out' });
    });
  });
  document.addEventListener('meta:content-change', () => {
    scrollDriver?.resize();
    updateScroll();
  });

  // Reading content stays still and fully visible; only process borders track position.
  if ('IntersectionObserver' in window) {
    const steps = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.target.classList.toggle('is-current', entry.isIntersecting));
    }, { threshold: .65 });
    document.querySelectorAll('.process-grid article').forEach(step => steps.observe(step));
  }

  resize();
  syncState();
})();
