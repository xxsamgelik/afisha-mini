// Единый reactive-store без Pinia: город (persist), категории, виджет продажи, тост.
// Данные листингов/деталок живут в самих views — их кэширует lib/api.js (TTL 300 c).

import { reactive } from 'vue'

import { setApiCity } from '@/lib/api'
import { haptic } from '@/lib/telegram'
import { getCities, getCategories } from '@/lib/endpoints'

const CITY_KEY = '24mini:city'

const SALEFRAME_HOST = import.meta.env.VITE_SALEFRAME_HOST || 'https://saleframe.24afisha.by'

export const store = reactive({
  ready: false,
  city: { id: 3, name: 'Минск', slug: 'minsk' },
  cities: [],
  categories: [],
  currencySymbol: 'р.',
  headerTitle: '',
  widget: { open: false, url: '', title: '' },
  toast: '',
})

function restoreCity() {
  try {
    const saved = JSON.parse(localStorage.getItem(CITY_KEY) || 'null')
    if (saved?.id && saved?.name) store.city = saved
  } catch {
    // приватный режим webview — остаёмся на Минске
  }
}

function persistCity() {
  try {
    localStorage.setItem(CITY_KEY, JSON.stringify(store.city))
  } catch {
    /* no-op */
  }
}

export async function init() {
  restoreCity()
  setApiCity(store.city.id)
  // города и категории — независимо: недоступность одного не блокирует второе
  getCities()
    .then((cities) => {
      store.cities = cities
    })
    .catch(() => {})
  await reloadCategories().catch(() => {})
  store.ready = true
}

export async function reloadCategories() {
  store.categories = await getCategories(store.city.id)
}

export function setCity(city) {
  if (!city?.id || city.id === store.city.id) return
  store.city = { id: city.id, name: city.name, slug: city.slug }
  setApiCity(city.id)
  persistCity()
  reloadCategories().catch(() => {})
}

// ── виджет продажи (saleframe) ───────────────────────────────────────────────
// URL — порт common/components/widget/widget.vue:113-146 + store/widget.js:168
// (openServiceItem), хост захардкожен на прод.

function openWidget(url, title) {
  haptic('medium')
  store.widget = { open: true, url, title }
}

export function openSession(session, title = '') {
  if (!session?.id) return
  openWidget(`${SALEFRAME_HOST}?sid=${session.id}&lang=ru`, title)
}

/** товар/билет события без дат: /item?oid=<institutionId>&iid=<itemId> */
export function openItem(item, title = '') {
  if (!item?.id) return
  openWidget(`${SALEFRAME_HOST}/item?oid=${item.institutionId}&iid=${item.id}&lang=ru`, title)
}

/** услуга: ?oid=<id площадки>&seid=<id услуги> */
export function openService(objectId, serviceId, title = '') {
  if (!objectId || !serviceId) return
  openWidget(`${SALEFRAME_HOST}?oid=${objectId}&seid=${serviceId}&lang=ru`, title)
}

export function closeWidget() {
  store.widget = { open: false, url: '', title: '' }
}

// ── тост ─────────────────────────────────────────────────────────────────────

let toastTimer = null

export function showToast(message) {
  store.toast = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    store.toast = ''
  }, 3000)
}
