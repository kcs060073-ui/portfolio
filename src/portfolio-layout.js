const nav = document.querySelector('.portfolioNav');
if (nav) {
  const links = nav.querySelector('.portfolioNavLinks');
  if (links) {
    const toggle = document.createElement('button');
    toggle.className = 'portfolioMenuToggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', '打开项目导航');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'portfolio-mobile-menu');
    toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5"/></svg>';
    const menu = document.createElement('nav');
    menu.id = 'portfolio-mobile-menu';
    menu.className = 'portfolioMobileMenu';
    menu.setAttribute('aria-label', '手机项目导航');
    menu.hidden = true;
    for (const link of links.querySelectorAll('a')) menu.append(link.cloneNode(true));
    document.body.append(menu);
    nav.append(toggle);
    nav.classList.add('has-mobile-menu');
    const setOpen = (open, focus = false) => {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭项目导航' : '打开项目导航');
      if (open && focus) menu.querySelector('a')?.focus();
    };
    toggle.addEventListener('click', () => setOpen(menu.hidden));
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true, true); }
    });
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('click', (event) => { if (!nav.contains(event.target) && !menu.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    matchMedia('(min-width: 981px)').addEventListener('change', (event) => { if (event.matches) setOpen(false); });
  }
}
