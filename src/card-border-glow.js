(() => {
  const cardSelector = [
    '.projectFeatureCard',
    '.projectSmallCard',
    '.strengthCard',
    '.resumeCards article',
    '.aboutExperienceCards a',
    '.caseSummaryGrid article',
    '.caseInsightGrid article',
    '.caseStepGrid article',
    '.caseRoleGrid article',
    '.caseReviewCard',
    '.caseCommunicationGrid article',
    '.caseGalleryGrid figure',
    '.casePptCard',
    '.xizhuMetricWall article',
    '.xizhuStepCard',
    '.xizhuRoleCard',
    '.chiweiMetricWall article',
    '.chiweiPersonaGrid article',
    '.chiweiCampaignRoadmap article',
    '.chiweiInsightGrid article',
    '.chiweiRoleGrid article',
    '.chiweiDeckCard',
    '.mediaMetricGrid article',
    '.mediaSystemGrid article',
    '.mediaWorkflowStep',
    '.mediaImpactCard',
    '.mediaContentCase',
    '.aiVideoCard',
    '.aiWorkflowStep',
    '.visualCapabilityGrid article',
    '.visualEventGrid button',
    '.visualHumanFacts article',
    '.visualMasonry button',
    '.visualLearnedGrid article'
  ].join(',');

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  const ensureGlowLayers = (card) => {
    card.classList.add('rb-border-glow-card');
    ['rb-border-light', 'rb-border-fill', 'rb-edge-light'].forEach((className) => {
      if (!card.querySelector(`:scope > .${className}`)) {
        const layer = document.createElement('span');
        layer.className = className;
        layer.setAttribute('aria-hidden', 'true');
        card.prepend(layer);
      }
    });
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getEdgeProximity = (rect, x, y) => {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;
  };

  const getCursorAngle = (rect, x, y) => {
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    if (dx === 0 && dy === 0) return 45;
    let degrees = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  const applyGlow = (card, event) => {
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    const edge = getEdgeProximity(rect, x, y);
    const angle = getCursorAngle(rect, x, y);

    card.style.setProperty('--edge-proximity', edge.toFixed(3));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    card.style.setProperty('--portfolio-glow-angle', `${angle.toFixed(3)}deg`);
    card.classList.add('is-card-glowing');
  };

  const pendingPointers = new WeakMap();
  const queuedCards = new WeakSet();

  const updateGlow = (card, event) => {
    pendingPointers.set(card, { clientX: event.clientX, clientY: event.clientY });
    if (queuedCards.has(card)) return;
    queuedCards.add(card);
    requestAnimationFrame(() => {
      queuedCards.delete(card);
      const pointer = pendingPointers.get(card);
      if (pointer) applyGlow(card, pointer);
    });
  };
  const clearGlow = (card) => {
    pendingPointers.delete(card);
    card.classList.remove('is-card-glowing');
    card.style.setProperty('--edge-proximity', '0');
  };

  const attach = () => {
    document.querySelectorAll(cardSelector).forEach((card) => {
      ensureGlowLayers(card);
      if (card.dataset.borderGlowReady === 'true') return;
      card.dataset.borderGlowReady = 'true';
      card.addEventListener('pointermove', (event) => updateGlow(card, event), { passive: true });
      card.addEventListener('pointerenter', (event) => updateGlow(card, event), { passive: true });
      card.addEventListener('pointerleave', () => clearGlow(card), { passive: true });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
})();
