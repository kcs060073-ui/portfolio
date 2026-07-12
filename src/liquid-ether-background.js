(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const firstHero = document.querySelector('.portfolioHero, .caseHero');

  const wrap = document.createElement('div');
  wrap.className = 'liquidEtherBackground';
  wrap.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  document.body.prepend(wrap);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let time = Math.random() * 100;
  let visible = false;
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetX = 0.5;
  let targetY = 0.5;
  let force = 0;
  let raf = 0;
  let lastFrame = 0;

  const colors = [
    [82, 39, 255],
    [255, 159, 252],
    [6, 182, 212],
    [183, 255, 47]
  ];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const updateVisibility = () => {
    const wasVisible = visible;
    if (!firstHero) {
      visible = true;
      wrap.classList.add('is-visible');
    } else {
      const rect = firstHero.getBoundingClientRect();
      visible = rect.bottom < window.innerHeight * 0.72;
      wrap.classList.toggle('is-visible', visible);
    }

    if (visible && !wasVisible && !raf && !document.hidden) {
      raf = requestAnimationFrame(draw);
    }
  };

  const drawBlob = (cx, cy, radius, color, alpha, phase) => {
    const points = 42;
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
    gradient.addColorStop(0.42, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.45})`);
    gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const wave = Math.sin(t * 3 + phase) * 0.12 + Math.cos(t * 5 - phase * 0.7) * 0.08;
      const r = radius * (1 + wave);
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  const draw = (now = performance.now()) => {
    if (!visible || document.hidden) {
      raf = 0;
      return;
    }
    if (now - lastFrame < 33) {
      raf = requestAnimationFrame(draw);
      return;
    }
    lastFrame = now;
    time += visible && !prefersReduced ? 0.006 : 0.0015;
    mouseX += (targetX - mouseX) * 0.065;
    mouseY += (targetY - mouseY) * 0.065;
    force += ((visible && finePointer ? 1 : 0.35) - force) * 0.04;

    ctx.clearRect(0, 0, width, height);
    if (visible || !firstHero) {
      ctx.globalCompositeOperation = 'lighter';
      const baseAlpha = document.body.classList.contains('liquid-detail') ? 0.095 : 0.13;
      const mx = mouseX * width;
      const my = mouseY * height;
      const drift = [
        [0.17, 0.28, 0.22, 0],
        [0.70, 0.18, 0.24, 1.5],
        [0.84, 0.70, 0.26, 3.0],
        [0.32, 0.82, 0.20, 4.2],
        [mouseX, mouseY, 0.18 + force * 0.05, 5.4]
      ];

      drift.forEach((item, index) => {
        const [px, py, scale, phaseOffset] = item;
        const orbital = index === 4 ? 0 : 34;
        const cx = px * width + Math.sin(time * (0.65 + index * 0.1) + phaseOffset) * orbital;
        const cy = py * height + Math.cos(time * (0.58 + index * 0.12) + phaseOffset) * orbital;
        const radius = Math.min(width, height) * (scale + (index === 4 ? force * 0.10 : 0));
        const alpha = index === 4 ? baseAlpha * 1.45 * force : baseAlpha;
        drawBlob(cx, cy, radius, colors[index % colors.length], alpha, time * 2 + phaseOffset);
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,255,0.032)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = (height / 10) * i + Math.sin(time + i) * 26;
        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 28) {
          const local = Math.sin(x * 0.008 + time * 2 + i * 0.9) * 20;
          const pull = Math.exp(-((x - mx) ** 2 + (y - my) ** 2) / 90000) * 34 * force;
          const yy = y + local + pull;
          if (x === -40) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  };

  if (finePointer) {
    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX / Math.max(1, width);
      targetY = event.clientY / Math.max(1, height);
      force = 1;
    }, { passive: true });
  }

  let viewportTicking = false;
  const requestVisibility = () => {
    if (viewportTicking) return;
    viewportTicking = true;
    requestAnimationFrame(() => {
      viewportTicking = false;
      updateVisibility();
    });
  };

  window.addEventListener('resize', () => {
    resize();
    requestVisibility();
  }, { passive: true });
  window.addEventListener('scroll', requestVisibility, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden) {
      requestVisibility();
    }
  });
  if (document.querySelector('.hbnCasePage')) {
    document.body.classList.add('liquid-detail');
  }

  resize();
  updateVisibility();
  if (visible) raf = requestAnimationFrame(draw);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();
