// Carga diferida de videos: el src real vive en data-src y se asigna recién
// cuando el video está cerca del viewport. Mientras tanto se ve el poster.
export function initLazyVideos() {
  const videos = document.querySelectorAll('video[data-src]');
  if (!videos.length) return;

  const load = (video) => {
    video.src = video.dataset.src;
    video.removeAttribute('data-src');
    video.load();
    // autoplay ya está en el markup; play() cubre navegadores que no lo
    // disparan al asignar src dinámicamente. Se ignora el rechazo
    // (ahorro de datos / autoplay bloqueado): queda visible el poster.
    if (video.autoplay) video.play().catch(() => {});
  };

  if (!('IntersectionObserver' in window)) {
    videos.forEach(load);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      load(entry.target);
    });
  }, { rootMargin: '300px 0px' });

  videos.forEach((video) => observer.observe(video));
}
