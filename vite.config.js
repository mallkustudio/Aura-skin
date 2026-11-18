import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const CONTENT_DIR = resolve(__dirname, 'content');

/* ------------------------------------------------------------
   Contenido editable (content/*.json)
   Cada archivo se expone en la plantilla con su nombre en
   camelCase: que-somos.json → {{queSomos.titulo}}.
   Campos obligatorios: "lista[].campo" valida cada ítem de la lista.
------------------------------------------------------------ */
const CONTENT_SCHEMA = {
  sitio: [
    'nombre', 'descripcion', 'whatsapp.numero', 'whatsapp.display',
    'instagram.usuario', 'instagram.url', 'reservas.url',
    'direccion.calle', 'direccion.cp', 'direccion.localidad', 'direccion.corta',
    'direccion.pais', 'direccion.mapsUrl', 'direccion.mapsEmbedUrl',
  ],
  hero: ['logo.src', 'logo.alt', 'logo.ancho', 'logo.alto', 'frase[]', 'bajada'],
  experiencias: [
    'etiqueta', 'titulo', 'descripcion', 'textoBoton',
    'cards[].titulo', 'cards[].video', 'cards[].poster', 'cards[].descripcion',
  ],
  espacio: [
    'etiqueta', 'titulo', 'tituloDestacado', 'descripcion',
    'imagenes[].src', 'imagenes[].alt', 'imagenes[].ancho', 'imagenes[].alto',
  ],
  'que-somos': [
    'etiqueta', 'titulo', 'tituloDestacado', 'descripcion',
    'imagenes[].src', 'imagenes[].alt', 'imagenes[].ancho', 'imagenes[].alto',
  ],
  opiniones: [
    'etiqueta', 'titulo', 'textoGoogle', 'googleReviewsUrl',
    'testimonios[].nombre', 'testimonios[].texto', 'testimonios[].rating',
  ],
  contacto: [
    'etiqueta', 'titulo', 'descripcion', 'whatsapp.texto', 'whatsapp.mensaje',
    'reservas.texto', 'reservas.ariaLabel', 'instagram.ariaLabel', 'mapaTitulo',
  ],
  footer: [
    'logo.src', 'logo.alt', 'logo.ancho', 'logo.alto',
    'textoComoLlegar', 'mensajeWhatsapp', 'textoBoton', 'anio',
  ],
};

// Campos que son URL o ruta: deben empezar con https://, http://, / o #
// y no llevar espacios ni comillas (van sin escapar dentro de atributos).
const URL_FIELDS = {
  sitio: ['instagram.url', 'reservas.url', 'direccion.mapsUrl', 'direccion.mapsEmbedUrl'],
  hero: ['logo.src'],
  experiencias: ['cards[].video', 'cards[].poster'],
  espacio: ['imagenes[].src'],
  'que-somos': ['imagenes[].src'],
  opiniones: ['googleReviewsUrl'],
  footer: ['logo.src'],
};
const VALID_URL = /^(https:\/\/|http:\/\/|\/|#)[^\s"']*$/;

// Devuelve [ruta concreta, valor] para una ruta como "imagenes[].src"
function fieldValues(data, path, prefix = '') {
  const [head, ...rest] = path.split('.');
  const key = head.endsWith('[]') ? head.slice(0, -2) : head;
  const value = data?.[key];
  if (head.endsWith('[]')) {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item, i) => (rest.length
      ? fieldValues(item, rest.join('.'), `${prefix}${key}[${i}].`)
      : [[`${prefix}${key}[${i}]`, item]]));
  }
  if (rest.length === 0) return [[`${prefix}${key}`, value]];
  return fieldValues(value, rest.join('.'), `${prefix}${key}.`);
}

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// Devuelve los campos faltantes para una ruta como "imagenes[].alt"
function missingFields(data, path) {
  const [head, ...rest] = path.split('.');
  if (head.endsWith('[]')) {
    const key = head.slice(0, -2);
    const list = data?.[key];
    if (!Array.isArray(list) || list.length === 0) return [`${key} (lista vacía o inexistente)`];
    if (rest.length === 0) {
      return list.flatMap((item, i) => (isEmpty(item) ? [`${key}[${i}]`] : []));
    }
    return list.flatMap((item, i) =>
      missingFields(item, rest.join('.')).map((m) => `${key}[${i}].${m}`));
  }
  const value = data?.[head];
  if (rest.length === 0) return isEmpty(value) ? [head] : [];
  return missingFields(value, rest.join('.')).map((m) => `${head}.${m}`);
}

function loadContent() {
  const content = {};
  const errors = [];
  for (const [name, fields] of Object.entries(CONTENT_SCHEMA)) {
    const file = `content/${name}.json`;
    let data;
    try {
      data = JSON.parse(readFileSync(resolve(CONTENT_DIR, `${name}.json`), 'utf8'));
    } catch (err) {
      errors.push(`${file}: ${err.code === 'ENOENT' ? 'el archivo no existe' : `JSON inválido (${err.message})`}`);
      continue;
    }
    for (const field of fields) {
      for (const missing of missingFields(data, field)) {
        errors.push(`${file}: falta el campo "${missing}"`);
      }
    }
    for (const field of URL_FIELDS[name] ?? []) {
      for (const [where, value] of fieldValues(data, field)) {
        if (isEmpty(value)) continue; // ya reportado como faltante
        if (typeof value !== 'string' || !VALID_URL.test(value)) {
          errors.push(`${file}: el campo "${where}" no es una URL o ruta válida (${JSON.stringify(value)}); debe empezar con https://, http://, / o # y no tener espacios ni comillas`);
        }
      }
    }
    content[name.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = data;
  }
  if (errors.length) {
    throw new Error(`Contenido inválido en content/:\n  - ${errors.join('\n  - ')}`);
  }
  return content;
}

/* ------------------------------------------------------------
   Helpers de plantilla
------------------------------------------------------------ */
const helpers = {
  // Link de WhatsApp con mensaje prellenado: {{{waLink sitio.whatsapp.numero "Hola"}}}
  waLink: (numero, mensaje) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
  // ★ repetidas según el rating
  stars: (n) => '★'.repeat(Number(n) || 0),
  // JSON-LD del negocio a partir de sitio.json (JSON.stringify, nunca concatenar)
  jsonLd: (sitio) => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'DaySpa',
      name: sitio.nombre,
      description: sitio.descripcion,
      telephone: `+${sitio.whatsapp.numero}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: sitio.direccion.calle,
        postalCode: sitio.direccion.cp,
        addressLocality: sitio.direccion.localidad,
        addressRegion: sitio.direccion.corta,
        addressCountry: sitio.direccion.pais,
      },
      sameAs: [sitio.instagram.url],
    };
    // "<" escapado para que ningún texto pueda cerrar el <script>
    return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
  },
};

// Recarga completa en dev al editar cualquier JSON de content/
const reloadOnContentChange = {
  name: 'reload-on-content-change',
  configureServer(server) {
    server.watcher.add(CONTENT_DIR);
  },
  handleHotUpdate({ file, server }) {
    if (file.startsWith(CONTENT_DIR.replace(/\\/g, '/')) && file.endsWith('.json')) {
      server.ws.send({ type: 'full-reload' });
      return [];
    }
  },
};

export default defineConfig({
  plugins: [
    handlebars({
      // Se relee en cada request: en dev los cambios se ven al recargar
      context: () => loadContent(),
      helpers,
    }),
    reloadOnContentChange,
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        headSpa: resolve(__dirname, 'head-spa.html'),
        masajeCorporal: resolve(__dirname, 'masaje-corporal.html'),
        limpiezaFacial: resolve(__dirname, 'limpieza-facial.html'),
        drenajeLinfatico: resolve(__dirname, 'drenaje-linfatico.html'),
        ritualCorporal: resolve(__dirname, 'ritual-corporal.html'),
      },
    },
  },
});
