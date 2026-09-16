// GET-обёртка над fetch. Жёсткие правила (проверено на живом API):
//  - CORS: access-control-allow-origin: *, но access-control-allow-headers ПУСТОЙ →
//    любой кастомный заголовок вызовет preflight, который упадёт.
//    Только GET, без заголовков, без credentials.
//  - кэш API: cache-control: max-age=300, public → свой in-memory кэш на те же 300 с.
//  - битый slug → HTTP 500 + {status:'error'} → ошибкой считается и не-2xx, и status:'error'.

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.24afisha.by'
const CACHE_TTL = 300_000
const TIMEOUT = 15_000

// cityId подставляется в каждый запрос; его пишет store при смене города
const context = { cityId: 3 }

export function setApiCity(cityId) {
  if (cityId) context.cityId = cityId
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function isAbort(err) {
  return err?.isAbort === true
}

function abortError() {
  const err = new Error('aborted')
  err.isAbort = true
  return err
}

const cache = new Map() // url → { t, body }

function buildUrl(path, params) {
  const qs = new URLSearchParams()
  const all = { cityId: context.cityId, lang: 'ru', slug: 'true', jsonld: 0, ...params }
  for (const [key, value] of Object.entries(all)) {
    if (value === undefined || value === null || value === '') continue
    qs.append(key, value) // ключи вида 'search[query]' уходят литерально
  }
  return `${API_BASE}${path}?${qs}`
}

/**
 * @param {string} path  например '/api/v3/mobile/afisha/kino'
 * @param {object} params  query-параметры (дефолтные cityId/lang/slug/jsonld уже внутри)
 * @param {{ signal?: AbortSignal, fresh?: boolean }} [opts]
 */
export async function request(path, params = {}, opts = {}) {
  const url = buildUrl(path, params)

  const hit = cache.get(url)
  if (!opts.fresh && hit && Date.now() - hit.t < CACHE_TTL) return hit.body

  // совмещаем внешний signal с таймаутом (AbortSignal.any в webview нет)
  const ctrl = new AbortController()
  const onOuterAbort = () => ctrl.abort()
  if (opts.signal) {
    if (opts.signal.aborted) throw abortError()
    opts.signal.addEventListener('abort', onOuterAbort, { once: true })
  }
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)

  let res
  try {
    res = await fetch(url, { method: 'GET', credentials: 'omit', signal: ctrl.signal })
  } catch {
    throw opts.signal?.aborted ? abortError() : new ApiError(0, 'Нет сети')
  } finally {
    clearTimeout(timer)
    if (opts.signal) opts.signal.removeEventListener('abort', onOuterAbort)
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    // не-JSON — обработается проверкой ниже
  }

  if (!res.ok || body?.status === 'error') {
    const msg = body?.errors?.[0]?.message || body?.message || `HTTP ${res.status}`
    throw new ApiError(res.status, msg, body)
  }

  cache.set(url, { t: Date.now(), body })
  return body
}
