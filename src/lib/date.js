// Все границы дней — по Минску (UTC+3, без DST), никогда по device-TZ.
export const MINSK_TZ = 'Europe/Minsk'
const DAY_MS = 86_400_000

const isoInMinsk = new Intl.DateTimeFormat('en-CA', { timeZone: MINSK_TZ }) // YYYY-MM-DD
const timeInMinsk = new Intl.DateTimeFormat('ru-RU', {
  timeZone: MINSK_TZ,
  hour: '2-digit',
  minute: '2-digit',
})

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

export function todayIso() {
  return isoInMinsk.format(new Date())
}

/** Date → 'YYYY-MM-DD' в минском времени */
export function toIso(date) {
  return isoInMinsk.format(date)
}

export function isValidIso(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/** Дата полудня по Минску — однозначна для любого смещения. */
function minskNoon(iso) {
  return new Date(`${iso}T12:00:00+03:00`)
}

/** unix-секунды начала дня (00:00 Минск) — для ?date= и ?time= */
export function dayStartUnix(iso) {
  return Math.floor((Date.parse(`${iso}T00:00:00+03:00`) || Date.now()) / 1000)
}

export function addDays(iso, n) {
  return isoInMinsk.format(new Date(minskNoon(iso).getTime() + n * DAY_MS))
}

export function weekdayShort(iso) {
  return WEEKDAYS_SHORT[minskNoon(iso).getUTCDay()]
}

export function isWeekend(iso) {
  const day = minskNoon(iso).getUTCDay()
  return day === 0 || day === 6
}

export function dayNumber(iso) {
  return Number(iso.slice(8, 10))
}

export function monthShort(iso) {
  return MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]
}

/** «16 сентября» */
export function dateHuman(iso) {
  return `${dayNumber(iso)} ${MONTHS_GEN[Number(iso.slice(5, 7)) - 1]}`
}

/**
 * Период показа из showFrom/showTo (unix-секунды):
 *   один день → «10 сентября», период → «с 10 сентября» (дата конца не влезает в карточку).
 * Порт логики compare() из common/mixin/event.js, даты — в минском времени.
 */
export function showPeriod(showFrom, showTo) {
  const from = showFrom ? toIso(new Date(showFrom * 1000)) : null
  const to = showTo ? toIso(new Date(showTo * 1000)) : null
  if (from && to) return from === to ? dateHuman(from) : `с ${dateHuman(from)}`
  if (from) return `с ${dateHuman(from)}`
  if (to) return `по ${dateHuman(to)}`
  return ''
}

/** «16 сентября, пт» */
export function dateHumanWithWeekday(iso) {
  return `${dateHuman(iso)}, ${weekdayShort(iso)}`
}

/** «19:30» из unix-секунд, всегда в минском времени */
export function timeHuman(unixSec) {
  return timeInMinsk.format(new Date(unixSec * 1000))
}

export function nowUnix() {
  return Math.floor(Date.now() / 1000)
}
