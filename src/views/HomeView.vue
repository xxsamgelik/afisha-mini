<script setup>
// Главная: чипы категорий + лента дат + листинг /api/v3/mobile/afisha/{slug}?date=…
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CategoryChips from '@/components/CategoryChips.vue'
import DateStrip from '@/components/DateStrip.vue'
import EventList from '@/components/EventList.vue'
import { isAbort } from '@/lib/api'
import { getListing } from '@/lib/endpoints'
import { dayStartUnix, isValidIso, todayIso } from '@/lib/date'
import { store } from '@/store'

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || 'top'))
const date = ref(isValidIso(route.query.date) ? route.query.date : todayIso())

const status = ref('loading') // loading | ready | empty | error
const events = ref([])
let ctrl = null

// ждём готовности store: категории определяют валидность slug'а
watch(
  [slug, date, () => store.ready],
  () => {
    if (!store.ready) return
    // неизвестный slug → API отдаёт 500; валидируем клиентски
    if (store.categories.length && !store.categories.some((c) => c.slug === slug.value)) {
      router.replace(`/c/${store.categories[0].slug}`)
      return
    }
    load()
  },
  { immediate: true },
)

async function load() {
  ctrl?.abort()
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    const data = await getListing({
      slug: slug.value,
      date: dayStartUnix(date.value),
      signal: ctrl.signal,
    })
    events.value = data.events
    status.value = data.events.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err)) status.value = 'error'
  }
}

function setDate(iso) {
  date.value = iso
  // replace: пользователь может тапнуть 30 дат — историю не раздуваем.
  // сегодняшняя дата из URL убирается, чтобы ссылки оставались чистыми.
  router.replace({
    query: {
      ...route.query,
      date: iso === todayIso() ? undefined : iso,
    },
  })
}

function onRetry() {
  load()
}
</script>

<template>
  <div>
    <CategoryChips />
    <DateStrip :model-value="date" @update:model-value="setDate" />
    <EventList
      :events="events"
      :status="status"
      :date="date"
      @retry="onRetry"
    />
  </div>
</template>
