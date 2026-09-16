<script setup>
// Сетка карточек + состояния loading/error/empty.
import { computed, ref, watch } from 'vue'

import EventCard from '@/components/EventCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import StateMessage from '@/components/StateMessage.vue'

defineEmits(['retry'])

const props = defineProps({
  events: { type: Array, default: () => [] },
  status: { type: String, default: 'loading' }, // loading | ready | empty | error
  date: { type: String, default: '' },
})

const PAGE = 30
const visible = ref(PAGE)

watch(
  () => [props.events, props.status],
  () => {
    visible.value = PAGE
  },
)

const shown = computed(() => props.events.slice(0, visible.value))
const hasMore = computed(() => props.events.length > visible.value)
</script>

<template>
  <div v-if="status === 'loading'" class="event-list event-list--skeleton">
    <SkeletonCard v-for="i in 6" :key="i" />
  </div>

  <StateMessage
    v-else-if="status === 'error'"
    icon="refresh"
    title="Не получилось загрузить"
    text="Проверьте соединение и попробуйте ещё раз"
    retryable
    @retry="$emit('retry')"
  />

  <StateMessage
    v-else-if="status === 'empty'"
    icon="calendar"
    title="На этот день ничего нет"
    text="Попробуйте выбрать другую дату"
  />

  <template v-else>
    <div class="event-list">
      <EventCard v-for="event in shown" :key="event.id" :event="event" :date="date" />
    </div>
    <button v-if="hasMore" class="event-list__more" type="button" @click="visible += PAGE">
      Показать ещё
    </button>
  </template>
</template>

<style scoped>
.event-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
  padding: 16px;
}

.event-list__more {
  display: block;
  margin: 4px 16px 8px;
  padding: 12px;
  border-radius: var(--r-pill);
  background: var(--surface-3);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}
</style>
