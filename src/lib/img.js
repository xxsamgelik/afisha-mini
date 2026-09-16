// imgproxy-параметры (?w=&h=) API не поддерживает — только готовые тумбы.
// Цепочки: тумба поменьше → побольше → оригинал. В списках original не брать (~140 КБ/кадр).

const API_HOST = import.meta.env.VITE_API_BASE || 'https://api.24afisha.by'

function resolve(src) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  return `${API_HOST}${src}`
}

/** постер карточки 240×340 */
export function poster(image) {
  return resolve(image?.['240x340'] || image?.['300x430'] || image?.original)
}

/** постер покрупнее ( hero-фолбэк, «похожие») */
export function posterLarge(image) {
  return resolve(image?.['300x430'] || image?.['240x340'] || image?.original)
}

/** широкий тумб 300×200 (если появится 16:9-карточка) */
export function landscape(image) {
  return resolve(image?.['300x200'] || image?.original)
}

/** hero на странице события: оригинал или первая картинка галереи */
export function hero(image, images) {
  return resolve(image?.original || images?.[0]?.original)
}
