<script setup>
// Главная: единая лента всех событий (тот же фид, что home 24afisha.by),
// без выбора категории и даты.
import { onMounted, ref } from 'vue'

import EventList from '@/components/EventList.vue'
import { isAbort } from '@/lib/api'
import { getHomeFeed } from '@/lib/endpoints'

const status = ref('loading') // loading | ready | empty | error
const events = ref([])
let ctrl = null

async function load() {
  ctrl?.abort()
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    events.value = await getHomeFeed(ctrl.signal)
    status.value = events.value.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err)) status.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <EventList :events="events" :status="status" @retry="load" />
</template>
