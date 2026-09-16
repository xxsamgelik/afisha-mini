// ─── JS-bridge «Оплати» — ЗАГЛУШКА ──────────────────────────────────────────
// Реальный SDK мини-аппов «Оплати» пока не предоставлен. Все функции безопасны
// без бриджа: никогда не бросают, возвращают {status:'unavailable'} или fallback.
// Когда придут доки — реализовать транспорт ниже, компоненты не меняются.
//
// Ожидаемые варианты транспорта (проверить при интеграции):
//   Android: window.OplatiBridge.method(jsonString) → sync string | undefined
//   iOS:     window.webkit.messageHandlers.oplati.postMessage({id, method, params})
//   Generic: window.Oplati?.postMessage({id, method, params})
// Ответы приходят в window message: {id, ok, data | error}.

import { openLink } from './telegram'

const pending = new Map() // id → { resolve, reject }
let seq = 0
let listening = false

function getBridge() {
  if (typeof window === 'undefined') return null
  if (window.OplatiBridge) return { kind: 'android', target: window.OplatiBridge }
  if (window.webkit?.messageHandlers?.oplati) return { kind: 'ios', target: window.webkit.messageHandlers.oplati }
  if (window.Oplati?.postMessage) return { kind: 'generic', target: window.Oplati }
  return null
}

export function hasBridge() {
  return getBridge() !== null
}

function ensureListener() {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('message', (event) => {
    const data = event.data
    if (!data || typeof data.id === 'undefined') return
    const p = pending.get(data.id)
    if (!p) return
    pending.delete(data.id)
    if (data.ok) p.resolve(data.data)
    else p.reject(new Error(data.error || 'bridge error'))
  })
}

function post(bridge, id, method, params) {
  const payload = { id, method, params }
  if (bridge.kind === 'android') bridge.target[method]?.(JSON.stringify(payload))
  else bridge.target.postMessage(payload, '*')
}

/**
 * Вызов метода бриджа. Без бриджа → {status:'unavailable'} через 10 с (не reject).
 * @returns {Promise<*>}
 */
export function call(method, params = {}) {
  const bridge = getBridge()
  if (!bridge) return waitUnavailable()
  ensureListener()
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, { resolve })
    post(bridge, id, method, params)
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        resolve({ status: 'timeout' })
      }
    }, 10_000)
  })
}

function waitUnavailable() {
  return new Promise((resolve) => setTimeout(() => resolve({ status: 'unavailable' }), 0))
}

/** fire-and-forget (молча, без ответа) */
export function fire(method, params = {}) {
  const bridge = getBridge()
  if (bridge) post(bridge, ++seq, method, params)
}

// ── публичные хуки ───────────────────────────────────────────────────────────

/** юзер из «Оплати» → {id?, phone?, name?} | null */
export async function getUser() {
  if (!hasBridge()) return null
  return call('getUser')
}

/** нативная оплата: {amountMinor, currency:'BYN', orderId, description} → {status:'paid'|'cancelled'|…} */
export const pay = (params) => call('pay', params)

/** открыть внешний URL (браузер) — fallback для iframe оплаты в webview */
export function openExternal(url) {
  if (hasBridge()) {
    fire('openExternal', { url })
    return
  }
  // в Telegram webview window.open часто заблокирован — нативный openLink
  openLink(url)
}

/** закрыть мини-апп */
export function closeApp() {
  fire('close')
}

/** заголовок в нативной шапке webview */
export function setTitle(title) {
  fire('setTitle', { title })
}
