export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Deteccion granular: en vez de un tema fijo por seccion, cuenta cuantos
  // elementos oscuros (hero + videos de experiencias) estan intersectando
  // la franja izquierda de la pantalla donde vive el nav.
  const darkElements = document.querySelectorAll('.hero, .exp-card__video-wrap');

  header.setAttribute('data-theme', 'dark');

  // Set en vez de contador: un contador global +1/-1 no distingue QUE
  // elemento cambio, asi que la entrada inicial "false" de un video
  // puede descontar el +1 que puso el hero (o cualquier otro elemento),
  // dejando el nav trabado en un tema incorrecto. El Set trackea el
  // estado real por elemento.
  const intersectingDark = new Set();
  let darkObserver = null;

  // rootMargin en PX reales del nav, no en % del viewport: un % fijo
  // (ej. 30%) aproxima mal el ancho real del nav (200/130/90px segun
  // breakpoint) — en una pantalla de 1440px, 30% son 432px, mas del
  // doble del nav real (200px). Cualquier video que asome en esa franja
  // de mas fuerza "dark" aunque el nav este parado sobre fondo cream.
  // Se recalcula en resize porque --nav-width cambia por breakpoint.
  function buildDarkObserver() {
    if (darkObserver) darkObserver.disconnect();
    intersectingDark.clear();

    const navWidth = header.getBoundingClientRect().width;
    const rightMargin = -(window.innerWidth - navWidth);

    darkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intersectingDark.add(entry.target);
        } else {
          intersectingDark.delete(entry.target);
        }
      });
      header.setAttribute('data-theme', intersectingDark.size > 0 ? 'dark' : 'light');
    }, {
      rootMargin: `0px ${rightMargin}px 0px 0px`,
      threshold: 0,
    });

    darkElements.forEach(el => darkObserver.observe(el));
  }

  buildDarkObserver();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildDarkObserver, 200);
  });

  const fill = document.querySelector('.nav__progress-fill');
  if (fill) {
    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      // Ajustar windowSize (10–20) para cambiar el alto visible del fill
      const windowSize = 15;
      const fillTop = Math.max(0, scrollPct - windowSize / 2);
      const fillBottom = Math.min(100, scrollPct + windowSize / 2);
      fill.style.top = fillTop + '%';
      fill.style.height = (fillBottom - fillTop) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}
