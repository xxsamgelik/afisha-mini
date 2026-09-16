// Все обращения к API 24afisha. Нормализация snake_case → camelCase — здесь,
// чтобы views всегда видели одну нотацию. Ключи картинок ('240x340') не трогаются.

import { request } from './api'

const camelize = (s) => s.replace(/[_-](\w)/g, (_, c) => c.toUpperCase())

export function camelizeDeep(input) {
  if (Array.isArray(input)) return input.map(camelizeDeep)
  if (input && typeof input === 'object') {
    const out = {}
    for (const [key, value] of Object.entries(input)) out[camelize(key)] = camelizeDeep(value)
    return out
  }
  return input
}

/** categories: {types:[{id,name,slug}]} */
export async function getCategories(cityId) {
  const body = await request('/api/v3/mobile/afisha/category', { cityId })
  return body?.types || []
}

/**
 * Главная лента: /api/v3/pages/afisha — тот же фид, что на home 24afisha.by.
 * Ответ сгруппирован по категориям ({top:…, kino:…}), собираем в плоский список
 * без дублей (top пересекается с тематическими группами).
 */
export async function getHomeFeed(signal) {
  const body = await request(
    '/api/v3/pages/afisha',
    { ignoreEndTime: 1, home_sort: 1, limit: 12, onlyData: 0, isMobile: 1 },
    { signal },
  )
  const seen = new Set()
  const events = []
  for (const group of Object.values(body?.data || {})) {
    for (const raw of group?.events || []) {
      const event = camelizeDeep(raw)
      if (!event?.slug || seen.has(event.slug)) continue
      seen.add(event.slug)
      events.push(event)
    }
  }
  return events
}

/**
 * Листинг категории. С датой → data.currentDate; без даты → data.month (группы
 * {performations}), собираем в плоский список.
 */
export async function getListing({ slug, date, signal }) {
  const body = await request(
    `/api/v3/mobile/afisha/${slug}`,
    {
      ...(date ? { date } : {}),
      ignoreEndTime: date ? 0 : 1,
      objectsIds: 0,
      home_sort: 1,
      onlyData: 0,
    },
    { signal },
  )
  const data = body?.data || {}
  const events = date
    ? camelizeDeep(data.currentDate) || []
    : (data.month || []).flatMap((group) => camelizeDeep(group?.performances) || [])
  return { events, filter: camelizeDeep(body?.filter) || {} }
}

/** Деталка события: {performance, objects, calendar, more, cities} */
export async function getEvent(eventSlug) {
  const body = await request(`/api/v3/pages/events/${eventSlug}`)
  return {
    performance: camelizeDeep(body?.performance) || null,
    objects: camelizeDeep(body?.objects) || [],
    calendar: body?.calendar || [], // {date:'YYYY-MM-DD', count} — не камелязим, ключ date
    more: camelizeDeep(body?.more?.data) || [],
  }
}

/**
 * Сеансы на день: data[0] = {name, objects:[{id,name,address,sessions}], events:[…]}
 * Цены сессий — копейки.
 */
export async function getSchedule(performanceId, dayStartUnix, signal) {
  const body = await request(
    `/api/v2/schedule/events/${performanceId}`,
    { time: dayStartUnix, ignoreEndTime: 1 },
    { signal },
  )
  return camelizeDeep(body?.data?.[0]) || null
}

/** Поиск: {performances:{items}, objects:{items}} → плоские массивы. Не кэшируется. */
export async function search(query, signal) {
  const body = await request(
    '/api/v2/search',
    { target: 'site', 'search[query]': query, 'search[type]': 1 },
    { signal, fresh: true },
  )
  return {
    performances: camelizeDeep(body?.performances?.items) || [],
    objects: camelizeDeep(body?.objects?.items) || [],
  }
}

/** Города: {data:[{id,name,slug,region:{name}}]} */
export async function getCities() {
  const body = await request('/api/v2/cities', { 'per-page': 100, cityId: undefined })
  const cities = camelizeDeep(body?.data) || []
  return cities
    .filter((city) => city?.id && city?.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}
