<script setup>
// Главная — как на 24afisha.by: секции по категориям из /api/v3/pages/afisha.
// Первая секция — «Рекомендуем» (top), заголовки остальных ведут в категорию.
// Все секции — горизонтальные мини-слайдеры (overflow-x).
import { onMounted, ref } from 'vue'

import EventCard from '@/components/EventCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import StateMessage from '@/components/StateMessage.vue'
import { isAbort } from '@/lib/api'
import { getHomeFeed } from '@/lib/endpoints'

const status = ref('loading') // loading | ready | empty | error
const sections = ref([])
let ctrl = null

async function load() {
  ctrl?.abort()
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    sections.value = await getHomeFeed(ctrl.signal)
    status.value = sections.value.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err)) status.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <div v-if="status === 'loading'" class="home-loading">
    <SkeletonCard v-for="i in 6" :key="i" />
  </div>

  <StateMessage
    v-else-if="status === 'error'"
    icon="refresh"
    title="Не получилось загрузить"
    text="Проверьте соединение и попробуйте ещё раз"
    retryable
    @retry="load"
  />

  <StateMessage
    v-else-if="status === 'empty'"
    icon="calendar"
    title="Пока ничего нет"
    text="Загляните позже — афиша обновляется"
  />

  <template v-else>
    <section v-for="(section, i) in sections" :key="section.meta?.slug || i" class="home-section">
      <div class="home-section__head">
        <h2 class="home-section__title">{{ section.meta?.name }}</h2>
        <router-link
          v-if="section.meta?.slug && section.meta.slug !== 'top'"
          class="home-section__all"
          :to="`/c/${section.meta.slug}`"
        >
          Все
        </router-link>
      </div>

      <div class="home-section__row scroll-row">
        <EventCard
          v-for="event in section.events"
          :key="event.id"
          class="home-section__row-card"
          :event="event"
        />
      </div>
    </section>
  </template>
</template>

<style scoped>
.home-loading {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
  padding: 16px;
}

.home-section {
  padding: 8px 0 8px;
}

.home-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 16px 12px;
}

.home-section__title {
  font-size: 20px;
  font-weight: 700;
}

.home-section__all {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand);
}

.home-section__row {
  gap: 12px;
  padding: 0 16px 4px;
}

.home-section__row-card {
  width: 140px;
  flex-shrink: 0;
}
</style>
