export function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const sections = document.querySelectorAll('[data-nav-theme]');
  if (!sections.length) return;

  header.setAttribute('data-theme', 'dark');

  let currentSection = sections[0];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        header.setAttribute('data-theme', entry.target.dataset.navTheme);
        currentSection = entry.target;
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
      const scrolledIn = window.scrollY - currentSection.offsetTop;
      const pct = Math.min(100, Math.max(0, (scrolledIn / currentSection.offsetHeight) * 100));
      fill.style.height = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}
