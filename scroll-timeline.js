/* Adapted from invalidnaaaame/dsh-scroll-timeline (MIT), itself derived from
 * vlln/dsh-navbar, Copyright (c) 2026 Sam Gao (vlln). See LICENSE.
 * Retains the original LEVEL profile, CSS-variable sizing, applyShape,
 * nearest-node hover selection, and requestAnimationFrame scheduling.
 * Adapted to document progress, right alignment, keyboard navigation,
 * and a persistent mountain around the reading position.
 */
(() => {
  const COUNT = 22;
  const LEVEL = [13, 10, 7, 5, 3];
  const bar = document.createElement('nav');
  bar.setAttribute('data-dsh-navbar', '');
  bar.setAttribute('aria-label', 'Прогресс чтения — переход по странице');
  const progress = document.createElement('div');
  progress.className = 'sr-only';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Прочитано');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  document.body.append(bar, progress);
  let activeIndex = 0;
  let hoverIndex = null;
  let baseW = 0;
  let peakW = 0;
  const dots = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const ensureSizes = () => {
    if (baseW > 0) return;
    const num = (name, fallback) => {
      const v = parseFloat(getComputedStyle(bar).getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    baseW = num('--dsh-navbar-base-w', 18);
    peakW = num('--dsh-navbar-peak-w', 58);
  };
  const levelWidth = d => Math.round(peakW * LEVEL[Math.min(d, LEVEL.length - 1)] / LEVEL[0]);
  const applyShape = () => {
    ensureSizes();
    const peak = hoverIndex ?? activeIndex;
    dots.forEach((dot, i) => {
      const width = Math.max(baseW, levelWidth(Math.abs(i - peak)));
      dot.style.setProperty('--tick-width', `${width}px`);
      dot.classList.toggle('hot', i === peak);
      if (i === activeIndex) dot.setAttribute('aria-current', 'location');
      else dot.removeAttribute('aria-current');
    });
  };
  const jumpTo = i => window.scrollTo({top: maxScroll() * i / (COUNT - 1), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('data-vlln-dot', '');
    dot.setAttribute('aria-label', `Перейти к ${Math.round(i / (COUNT - 1) * 100)}% страницы`);
    dot.addEventListener('click', () => jumpTo(i));
    dot.addEventListener('focus', () => { hoverIndex = i; applyShape(); });
    dot.addEventListener('blur', () => { hoverIndex = null; applyShape(); });
    dot.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = Math.min(COUNT - 1, i + 1);
      if (event.key === 'ArrowUp') next = Math.max(0, i - 1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = COUNT - 1;
      if (next === undefined) return;
      event.preventDefault();
      dots[next].focus();
      jumpTo(next);
    });
    dots.push(dot);
    bar.appendChild(dot);
  }
  const updateNear = clientY => {
    let best = 0;
    let bestDist = Infinity;
    dots.forEach((dot, i) => {
      const r = dot.getBoundingClientRect();
      const dist = Math.abs(clientY - (r.top + r.height / 2));
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best === hoverIndex) return;
    hoverIndex = best;
    applyShape();
  };
  bar.addEventListener('pointermove', event => { if(event.pointerType !== 'touch') updateNear(event.clientY); }, {passive:true});
  bar.addEventListener('pointerleave', () => { hoverIndex = null; applyShape(); });
  const updateActive = () => {
    const limit = maxScroll();
    const fraction = limit ? Math.min(1, Math.max(0, scrollY / limit)) : 0;
    activeIndex = Math.round(fraction * (COUNT - 1));
    progress.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    applyShape();
  };
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateActive(); });
  };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', () => { baseW = 0; schedule(); });
  new ResizeObserver(schedule).observe(document.querySelector('article') || document.documentElement);
  updateActive();
})();
