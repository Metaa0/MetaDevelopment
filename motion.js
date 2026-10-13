// Decorative layer: a quiet violet wave grid behind the page, plus desktop wheel smoothing.
// Content never depends on this file. Reduced motion gets one still frame; hidden tabs stop the loop.
(() => {
  const canvas = document.querySelector("[data-ambient-canvas]");
  const context = canvas?.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 620px)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)");
  const color = "187, 140, 255";
  const pointer = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 };
  let width = 0, height = 0, phase = 0, last = 0, frame = 0, lenis = null;

  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const rows = compact.matches ? 10 : 14;
    const amplitude = compact.matches ? 16 : 30;
    const drift = Math.sin(window.scrollY / Math.max(height, 1) * 0.35) * 18;
    const wave = (x, row) => {
      const base = height * 0.08 + (row / rows) * height * 1.02;
      const bend = Math.exp(-Math.pow((x / width - pointer.x) * 3, 2));
      return base + Math.sin(x / width * 4.5 + phase + row * 0.3) * amplitude
        + Math.cos(x / width * 7 - phase * 0.5) * 8
        + bend * (pointer.y - 0.5) * 40 + drift;
    };
    context.lineWidth = 0.8;
    for (let row = 0; row < rows; row++) {
      context.strokeStyle = `rgba(${color}, ${row % 4 === 0 ? 0.17 : 0.075})`;
      context.beginPath();
      for (let x = -20; x <= width + 20; x += 26) {
        const y = wave(x, row);
        x === -20 ? context.moveTo(x, y) : context.lineTo(x, y);
      }
      context.stroke();
    }
    context.strokeStyle = `rgba(${color}, 0.045)`;
    const columns = compact.matches ? 9 : 14;
    for (let column = 0; column < columns; column++) {
      const x = column / (columns - 1) * width;
      context.beginPath();
      for (let row = 0; row < rows; row++) row === 0 ? context.moveTo(x, wave(x, row)) : context.lineTo(x, wave(x, row));
      context.stroke();
    }
    // A few short signals travel along the lines.
    for (let index = 0; index < (compact.matches ? 3 : 5); index++) {
      const row = (index * 3 + 2) % rows;
      const x = ((phase * 0.04 + index * 0.21) % 1) * (width + 70) - 35;
      context.strokeStyle = `rgba(${color}, 0.5)`;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(x - 26, wave(x - 26, row));
      context.lineTo(x, wave(x, row));
      context.stroke();
      context.fillStyle = `rgba(${color}, 0.75)`;
      context.beginPath();
      context.arc(x, wave(x, row), 1.6, 0, Math.PI * 2);
      context.fill();
      context.lineWidth = 0.8;
    }
  };

  const running = () => !reduced.matches && !document.hidden;
  const tick = (now) => {
    frame = 0;
    if (!running()) return;
    const elapsed = now - last;
    if (elapsed >= 1000 / 24) {
      phase += Math.min(elapsed, 70) * 0.00016;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      last = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const play = () => {
    if (frame || !running()) { draw(); return; }
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    if (!context) return;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointer.tx = event.clientX / Math.max(width, 1);
    pointer.ty = event.clientY / Math.max(height, 1);
  }, { passive: true });
  document.addEventListener("visibilitychange", play);
  reduced.addEventListener("change", play);
  resize();
  play();

  // Smooth wheel scrolling: desktop mouse/trackpad only, never touch or reduced motion.
  const syncScroll = () => {
    const want = typeof window.Lenis === "function" && finePointer.matches && !reduced.matches;
    if (want && !lenis) lenis = new window.Lenis({ autoRaf: true, lerp: 0.16, wheelMultiplier: 1, anchors: { offset: -80 } });
    if (!want && lenis) { lenis.destroy(); lenis = null; }
  };
  finePointer.addEventListener("change", syncScroll);
  reduced.addEventListener("change", syncScroll);
  syncScroll();
})();
