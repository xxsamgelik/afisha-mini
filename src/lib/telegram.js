// ─── Адаптер Telegram Mini Apps ─────────────────────────────────────────────
// Telegram открывает наш URL в своём webview и внедряет window.Telegram.WebApp
// (скрипт telegram-web-app.js подключён в index.html). В обычном браузере всё
// ниже — безопасные no-op.
//
// Чтобы зарегистрировать апп: @BotFather → /newapp (или Menu Button) → URL.
// Требование Telegram: публичный HTTPS с валидным сертификатом.

const tg = () =>
  typeof window !== 'undefined' ? window.Telegram?.WebApp : null

/** внутри Telegram? (в браузере скрипт SDK тоже задаёт WebApp, но platform='unknown') */
export function isTelegram() {
  const webApp = tg()
  return Boolean(webApp?.platform && webApp.platform !== 'unknown')
}

/**
 * initData пользователя (base64 в tgWebAppData). Telegram кладёт её в query,
 * а Telegram Desktop — прямо в hash (url#tgWebAppData=…), из-за чего hash-роутер
 * видел «путь» — этот кейс ловит guard в router/index.js. Читаем сырой URL.
 * Проверка подписи делается на бэкенде (hash в payload), здесь просто доступ.
 */
export function getInitData() {
  const { search, hash } = window.location
  const fromSearch = new URLSearchParams(search).get('tgWebAppData')
  if (fromSearch) return fromSearch
  const fromHash = new URLSearchParams(hash.replace(/^#/, '')).get('tgWebAppData')
  return fromHash || ''
}

/**
 * Инициализация: ready/expand, брендирование шапки, нативная кнопка «Назад».
 * Вызывается один раз из main.js с роутером.
 */
export function initTelegram(router) {
  const webApp = tg()
  if (!isTelegram()) return

  try {
    webApp.ready()
    webApp.expand()
  } catch {
    /* no-op */
  }
  try {
    webApp.setHeaderColor('#6236ff') // --brand
    webApp.setBackgroundColor('#ffffff')
  } catch {
    /* старые клиенты */
  }
  try {
    // вертикальные свайпы конфликтуют с горизонтальными слайдерами
    webApp.disableVerticalSwipes?.()
  } catch {
    /* API есть не везде */
  }

  // нативная «Назад» — показываем только там, где есть куда возвращаться
  const backButton = webApp.BackButton
  if (backButton) {
    const sync = () => {
      if (window.history.state?.back != null) backButton.show()
      else backButton.hide()
    }
    router.afterEach(sync)
    backButton.onClick(() => router.back())
    sync()
  }
}

/** открыть внешний URL (fallback покупки «в браузере»); внутри Telegram — нативно */
export function openLink(url) {
  if (isTelegram() && tg().openLink) {
    tg().openLink(url)
    return
  }
  window.open(url, '_blank', 'noopener')
}

/** лёгкий хаптик на действия (покупка, выбор города) */
export function haptic(impact = 'light') {
  try {
    tg()?.HapticFeedback?.impactOccurred(impact)
  } catch {
    /* no-op */
  }
}
