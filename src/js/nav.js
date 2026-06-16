export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const sections = document.querySelectorAll('[data-nav-theme]');
  if (!sections.length) return;

  // Default: hero is dark (page always starts there)
  header.setAttribute('data-theme', 'dark');

  // Fires when a section enters the top 20% of the viewport.
  // rootMargin '0px 0px -80% 0px' shrinks the detection zone to the top fifth,
  // so the theme switches at the moment a section's leading edge reaches that band.
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
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      fill.style.height = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}
