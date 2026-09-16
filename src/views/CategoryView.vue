<script setup>
// Страница категории: /api/v3/mobile/afisha/{slug} без даты (month-режим),
// плоский список. Выбор даты в мини-аппе нет — «все ближайшие».
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EventList from '@/components/EventList.vue'
import { isAbort } from '@/lib/api'
import { getListing } from '@/lib/endpoints'
import { store } from '@/store'

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))

const status = ref('loading') // loading | ready | empty | error
const events = ref([])
let ctrl = null

watch(
  [slug, () => store.ready],
  () => {
    if (!store.ready) return
    // неизвестный slug → API отдаёт 500; валидируем клиентски
    if (store.categories.length && !store.categories.some((c) => c.slug === slug.value)) {
      router.replace('/')
      return
    }
    store.headerTitle = store.categories.find((c) => c.slug === slug.value)?.name || ''
    load()
  },
  { immediate: true },
)

async function load() {
  ctrl?.abort()
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    const data = await getListing({ slug: slug.value, date: null, signal: ctrl.signal })
    events.value = data.events
    status.value = data.events.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err)) status.value = 'error'
  }
}
</script>

<template>
  <EventList :events="events" :status="status" @retry="load" />
</template>
