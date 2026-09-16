# afisha-mini

Мобильный веб-клиент [24afisha.by](https://24afisha.by) — мини-апп для webview платёжного сервиса «Оплати». Vue 3 + Vite SPA, без SSR, без UI-библиотек; весь стек — `vue`, `vue-router`, `vite`.

## Запуск

```bash
yarn            # node >= 20.11
yarn dev        # http://localhost:5173 (host: true — можно открыть с телефона по LAN)
yarn lint
yarn build      # → dist/
yarn preview    # раздача dist на :5174
```

## Что внутри

- **Шапка** — на главной и в категории, как на 24afisha.by: градиент + лого/город/поиск + лента категорий белым текстом; на внутренних страницах — sticky «назад + заголовок».
- **Главная** (`/#/`) — секции по категориям из `/api/v3/pages/afisha` (как home сайта): «Рекомендуем», «Кино», «Театр»…; каждая секция — горизонтальный мини-слайдер карточек; «Все» → категория; дубли между секциями убраны.
- **Категория** (`/#/c/:slug`) — список ближайших событий категории (month-режим листинга, без выбора даты).
- **Событие** (`/#/event/:slug`) — hero 16:9, свёрнутое описание, расписание с вкладками дней (дни без событий — disabled), сеансы по площадкам; у событий **без дат** (товары/услуги) вместо расписания — билеты/товары (`performance.items`) и услуги (`objectsWithActiveServices`) с покупкой; «Похожие».
- **Поиск** (`/#/search`) — дебаунс 300 мс, только события.
- **Город** (`/#/city`) — выбор города, хранится в `localStorage['24mini:city']`.

## API

Бьётся напрямую из браузера в `https://api.24afisha.by` (CORS открыт: `access-control-allow-origin: *`). Правила, которые нельзя нарушать — см. `src/lib/api.js`:

- только GET, **никаких кастомных заголовков** (у API пустой `access-control-allow-headers` → preflight упадёт), без credentials;
- каждый запрос получает `cityId, lang=ru, slug=true, jsonld=0`;
- кэш ответов 300 c (`max-age=300`) — свой in-memory кэш в `lib/api.js`;
- битый slug → HTTP 500 + `{status:'error'}` — обрабатываются оба случая.

Цены: списки/деталка — строки в рублях `'46.00'`; расписание — копейки (`1600` = 16,00 р.). Границы суток — всегда Минск (UTC+3): `src/lib/date.js`.

## Покупка

Все три вида покупок открывают существующий виджет продажи в полноэкранном iframe (`src/components/SaleWidget.vue`); строители URL — в `src/store/index.js`, порт `common/components/widget/widget.vue:113-146` и `apps/afisha/store/widget.js:168`:

- сеанс: `?sid=<sessionId>&lang=ru`
- товар/билет (события без дат): `/item?oid=<institutionId>&iid=<itemId>&lang=ru`
- услуга: `?oid=<id площадки>&seid=<id услуги>&lang=ru`

Протокол postMessage — порт `widget.vue:94-112`: `closeFrame`, `closeFrameError`, `requestToken` (отвечаем `{action:'auth', token:''}` — логина в мини-аппе нет).

## Интеграция «Оплати» (TODO)

SDK мини-аппов пока не предоставлен. Заглушка-бридж — `src/lib/oplati.js`: `getUser`, `pay`, `openExternal`, `share`, `closeApp`, `setTitle`. Все функции безопасны без бриджа (никогда не бросают). Когда придут доки — реализовать транспорт в `getBridge()/call()`, компоненты не меняются.

## Конфигурация

| Переменная | По умолчанию | Зачем |
|---|---|---|
| `VITE_API_BASE` | `https://api.24afisha.by` | хост API (staging: `https://webgate.arcom.of.by`) |
| `VITE_SALEFRAME_HOST` | `https://saleframe.24afisha.by` | хост виджета продажи |

## Деплой

`yarn build` → `Dockerfile` (nginx:alpine + `nginx.conf` со SPA-fallback). Роутер работает на hash-режиме (`/#/...`) — не зависит от пути, где «Оплати» разместит апп; переход на `createWebHistory()` — одна строка в `src/router/index.js` (nginx уже готов).
