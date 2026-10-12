// Smooth wheel scrolling only: desktop mouse/trackpad, never touch, never with reduced motion.
// Native scrolling and anchors keep working if Lenis is missing.
(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lenis = null;

  const start = () => {
    if (lenis || typeof window.Lenis !== "function" || !finePointer.matches || reduced.matches) return;
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.16, wheelMultiplier: 1, anchors: { offset: -80 } });
  };
  const stop = () => {
    lenis?.destroy();
    lenis = null;
  };
  const sync = () => (finePointer.matches && !reduced.matches ? start() : stop());

  finePointer.addEventListener("change", sync);
  reduced.addEventListener("change", sync);
  sync();
})();
