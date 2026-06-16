export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const sections = document.querySelectorAll('[data-nav-theme]');
  if (!sections.length) return;

  header.setAttribute('data-theme', 'dark');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        header.setAttribute('data-theme', entry.target.dataset.navTheme);
      }
    });
  }, {
    rootMargin: '0px 0px -80% 0px',
    threshold: 0,
  });

  sections.forEach(section => observer.observe(section));

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
