// Las cards se renderizan en el build desde content/opiniones.json.
// Acá queda solo la navegación del carrusel.
export function initOpiniones() {
  const track   = document.getElementById('opinionesTrack');
  const prevBtn = document.getElementById('opinionesPrev');
  const nextBtn = document.getElementById('opinionesNext');

  if (!track) return;

  function scrollAmount() {
    const card = track.querySelector('.opinion-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  }

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
}
