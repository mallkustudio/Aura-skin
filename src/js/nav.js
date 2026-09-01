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

  // Sin rootMargin: el criterio no es "el elemento esta en la franja del
  // nav" sino "el elemento oscuro esta visible en pantalla" — si un video
  // de experiencias esta en pantalla (en cualquier columna), el nav fijo
  // a la izquierda tambien lo esta viendo. Restringir a una franja de
  // ancho igual al nav dejaba afuera los videos que arrancan despues del
  // nav (ej. las cards de la derecha en el grid de experiencias).
  const darkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        intersectingDark.add(entry.target);
      } else {
        intersectingDark.delete(entry.target);
      }
    });
    header.setAttribute('data-theme', intersectingDark.size > 0 ? 'dark' : 'light');
  }, {
    threshold: 0.15,
  });

  darkElements.forEach(el => darkObserver.observe(el));

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
