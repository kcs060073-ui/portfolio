(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const isHome = Boolean(document.querySelector('.portfolioHero'));

  const initOpening = () => {
    if (!isHome || sessionStorage.getItem('portfolioOpeningSeen') === 'true') {
      document.body.classList.add('motion-ready', 'motion-start');
      return;
    }

    document.body.classList.add('motion-ready');
    const opening = document.createElement('div');
    opening.className = 'premiumOpening';
    opening.innerHTML = '<div class="openingMark">PORTFOLIO<span>CONTENT / OPERATION / AI</span></div>';
    document.body.appendChild(opening);

    requestAnimationFrame(() => {
      window.setTimeout(() => document.body.classList.add('motion-start'), 260);
      window.setTimeout(() => opening.classList.add('is-finished'), 1180);
      window.setTimeout(() => {
        opening.remove();
        sessionStorage.setItem('portfolioOpeningSeen', 'true');
      }, 1900);
    });
  };

  const addMotionClasses = () => {
    document.querySelectorAll([
      '.resumeHeading h2',
      '.strengthsHeader h2',
      '.projectSectionHeader h2',
      '.caseHero h1',
      '.caseSectionHeader h2',
      '.caseCopy h2',
      '.visualFinal h2'
    ].join(',')).forEach((el) => el.classList.add('motion-title'));

    document.querySelectorAll([
      '.resumeHeading span',
      '.strengthsHeader p',
      '.projectLead',
      '.caseHeroLead',
      '.caseSectionHeader p',
      '.caseCopy p',
      '.visualHeroIntro',
      '.contactInner p'
    ].join(',')).forEach((el) => el.classList.add('motion-copy'));

    document.querySelectorAll([
      '.resumeCards a',
      '.strengthCard',
      '.projectFeatureCard',
      '.projectSmallCard',
      '.caseSummaryGrid article',
      '.caseInsightGrid article',
      '.caseStepGrid article',
      '.caseRoleGrid article',
      '.caseReviewCard',
      '.caseCommunicationGrid article',
      '.mediaContentCase',
      '.mediaMetricGrid article',
      '.mediaSystemGrid article',
      '.mediaWorkflowStep',
      '.mediaImpactCard',
      '.aiVideoCard',
      '.aiWorkflowStep',
      '.visualCapabilityGrid article',
      '.visualEventGrid button',
      '.visualHumanFacts article',
      '.visualLearnedGrid article',
      '.xizhuMetricWall article',
      '.xizhuStepCard',
      '.xizhuRoleCard',
      '.chiweiMetricWall article',
      '.chiweiPersonaGrid article',
      '.chiweiCampaignRoadmap article',
      '.chiweiInsightGrid article',
      '.chiweiRoleGrid article',
      '.chiweiDeckCard'
    ].join(',')).forEach((el) => el.classList.add('motion-card'));

    document.querySelectorAll([
      '.resumePortrait',
      '.projectCover',
      '.projectMiniCover',
      '.caseHeroImage',
      '.caseImageCard',
      '.caseWideImage',
      '.caseMiniImage',
      '.caseGalleryGrid figure',
      '.visualHeroImage',
      '.visualMasonry button'
    ].join(',')).forEach((el) => el.classList.add('motion-image'));

    document.querySelectorAll('.projectCover, .projectMiniCover, .caseHeroImage img, .caseImageCard img, .caseWideImage img, .visualHeroImage img').forEach((el) => {
      el.classList.add('motion-parallax');
    });

    document.querySelectorAll('.strengthsGrid, .coreProjectGrid, .extendedProjectGrid, .resumeCards, .caseSummaryGrid, .caseInsightGrid, .caseStepGrid, .caseRoleGrid, .caseCommunicationGrid, .mediaContentCaseLayout, .mediaMetricGrid, .mediaSystemGrid, .visualEventGrid, .visualLearnedGrid').forEach((group) => {
      group.querySelectorAll('.motion-card, .motion-image').forEach((item, index) => {
        item.style.setProperty('--motion-delay', `${Math.min(index * 110, 660)}ms`);
      });
    });
  };

  const observeMotion = () => {
    const targets = document.querySelectorAll('.motion-title, .motion-copy, .motion-card, .motion-image');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((target) => observer.observe(target));
  };

  const initParallax = () => {
    const items = Array.from(document.querySelectorAll('.motion-parallax'));
    if (!items.length) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight || 1;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const y = Math.max(-18, Math.min(18, progress * -24));
        item.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
      });
      ticking = false;
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    request();
  };

  initOpening();
  addMotionClasses();
  observeMotion();
  initParallax();
})();
