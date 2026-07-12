(() => {
  if (window.__aiDitherMounted) return;
  window.__aiDitherMounted = true;

  const root = document.querySelector('.aiLabPage');
  if (!root) return;

  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'aiDitherCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  root.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const config = {
    waveSpeed: isMobile || reduceMotion ? 0 : 0.035,
    waveFrequency: 2.65,
    waveAmplitude: 0.2,
    colorNum: 4,
    pixelSize: isMobile ? 4 : 3,
    mouseRadius: 0.32,
    opacity: 0.18
  };

  let width = 1;
  let height = 1;
  let dpr = 1;
  let last = 0;
  const mouse = { x: -2, y: -2, tx: -2, ty: -2, active: 0, targetActive: 0 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (time = 0) => {
    const t = time * 0.001 * config.waveSpeed;
    const step = config.pixelSize;
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);
    const radius = config.mouseRadius;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    mouse.active += (mouse.targetActive - mouse.active) * 0.035;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(5, 6, 5, .18)';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const nx = x / cols;
        const ny = y / rows;
        const dx = nx - mouse.x;
        const dy = ny - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseWave = Math.max(0, 1 - dist / radius) * mouse.active;
        const wave =
          Math.sin((nx * config.waveFrequency + t + mouseWave * 0.42) * Math.PI * 2) * config.waveAmplitude +
          Math.cos((ny * (config.waveFrequency + 0.55) - t * 0.7 + mouseWave * 0.32) * Math.PI * 2) * config.waveAmplitude;
        const labGlow = Math.max(0, 1 - Math.hypot(nx - 0.66, ny - 0.22) * 1.45) * 0.28;
        const grain = Math.abs(Math.sin((x * 19.19 + y * 43.73 + Math.floor(time * 0.02)) * 913.7)) * 0.08;
        const value = Math.max(0, Math.min(1, 0.42 + wave + mouseWave * 0.18 + labGlow + grain));
        const level = Math.round(value * (config.colorNum - 1)) / (config.colorNum - 1);
        const alpha = level * config.opacity;
        if (alpha <= 0.018) continue;
        const tone = Math.round(150 + level * 92);
        ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha.toFixed(3)})`;
        ctx.fillRect(x * step, y * step, step + 0.25, step + 0.25);
      }
    }
  };

  const tick = (time) => {
    if (!document.hidden && (!last || time - last > 44)) {
      last = time;
      draw(time);
    }
    if (!isMobile && !reduceMotion) requestAnimationFrame(tick);
  };

  const onPointerMove = (event) => {
    if (isMobile || reduceMotion) return;
    mouse.tx = event.clientX / width;
    mouse.ty = event.clientY / height;
    mouse.targetActive = 1;
  };

  const onPointerLeave = () => {
    mouse.targetActive = 0;
  };

  resize();
  draw(0);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  if (!isMobile && !reduceMotion) requestAnimationFrame(tick);
})();
