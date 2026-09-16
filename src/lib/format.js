// У API два формата цен:
//  - списки/деталка: строки в рублях '46.00' ('0.00'/0/null — цены нет, скрыть)
//  - расписание: целые копейки (1600 = 16,00 р.)

export function formatRub(value) {
  const n = Number(value)
  if (!value || Number.isNaN(n) || n === 0) return ''
  return n.toFixed(2).replace('.', ',')
}

export function formatKopecks(minor) {
  const n = Number(minor)
  if (!minor || Number.isNaN(n) || n === 0) return ''
  return (n / 100).toFixed(2).replace('.', ',')
}

/** «от 46,00 р.» или '' */
export function priceLabel(minPrice, currency = 'р.') {
  const v = formatRub(minPrice)
  return v ? `от ${v} ${currency}` : ''
}

/** «от 16,00 р.» или '' */
export function kopecksLabel(minPrice, currency = 'р.') {
  const v = formatKopecks(minPrice)
  return v ? `от ${v} ${currency}` : ''
}

/** минуты → «2 ч 30 мин» */
export function durationHuman(minutes) {
  const n = Number(minutes)
  if (!n || Number.isNaN(n) || n <= 0) return ''
  const h = Math.floor(n / 60)
  const m = n % 60
  if (h && m) return `${h} ч ${m} мин`
  if (h) return `${h} ч`
  return `${m} мин`
}
