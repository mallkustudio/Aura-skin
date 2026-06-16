// TODO: Reemplazar por reviews reales de Google cuando el perfil de Google Business esté creado
const testimonios = [
  { nombre: "María L.",    texto: "Una experiencia de calma total. El cuidado en cada detalle se nota desde que entrás.", rating: 5 },
  { nombre: "Carolina R.", texto: "El mejor head spa que probé. Salgo siempre renovada y con la piel increíble.",         rating: 5 },
  { nombre: "Julieta M.",  texto: "Atención personalizada y un ambiente que invita a desconectar completamente.",          rating: 5 },
  { nombre: "Sofía B.",    texto: "Profesionalismo y calidez en partes iguales. Ya es mi lugar de confianza.",            rating: 5 },
];

export function initOpiniones() {
  const track   = document.getElementById('opinionesTrack');
  const prevBtn = document.getElementById('opinionesPrev');
  const nextBtn = document.getElementById('opinionesNext');

  if (!track) return;

  track.innerHTML = testimonios.map(({ nombre, texto, rating }) => `
    <article class="opinion-card">
      <div class="opinion-card__stars">${'★'.repeat(rating)}</div>
      <p class="opinion-card__text">"${texto}"</p>
      <span class="opinion-card__name">${nombre}</span>
    </article>
  `).join('');

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
