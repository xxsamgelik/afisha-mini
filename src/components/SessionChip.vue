<script setup>
// Чип сеанса: время + «от 16,00 р.» (цены расписания — копейки).
// Disable — точный порт common/components/session/session.vue:26,54:
//   soldOut (тег «Продано») || ((!isSaleOpen && !isBooking) || timeSpendingStopsale < now)
//   (stopsale МЕНЬШЕ now = продажа закрыта; stopsale больше — ещё в продаже)
import { computed } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { kopecksLabel } from '@/lib/format'
import { nowUnix, timeHuman } from '@/lib/date'

const props = defineProps({
  session: { type: Object, required: true },
})

const emit = defineEmits(['buy'])

const SOLD_OUT_TAG = 'Продано'

const isDisabled = computed(() => {
  const s = props.session
  const soldOut = (s.tags || []).some((tag) => tag.name === SOLD_OUT_TAG)
  return soldOut || (!s.isSaleOpen && !s.isBooking) || (s.timeSpendingStopsale && s.timeSpendingStopsale < nowUnix())
})

const label = computed(() => props.session.timeStr || timeHuman(props.session.timeSpending))

const price = computed(() => kopecksLabel(props.session.minPrice))

const tags = computed(() =>
  (props.session.tags || [])
    .filter((tag) => tag.name !== SOLD_OUT_TAG && tag.name !== '2D')
    .slice(0, 2),
)
</script>

<template>
  <button
    class="session-chip"
    :class="{ 'is-disabled': isDisabled }"
    type="button"
    :disabled="isDisabled"
    @click="emit('buy', session)"
  >
    <span class="session-chip__row">
      <AppIcon name="ticket" :size="14" />
      <span class="session-chip__time">{{ label }}</span>
    </span>
    <span v-if="tags.length" class="session-chip__tags">{{ tags.map((t) => t.name).join(' · ') }}</span>
    <span v-if="price" class="session-chip__price">{{ price }}</span>
    <span v-else-if="isDisabled" class="session-chip__price session-chip__price--muted">недоступно</span>
  </button>
</template>

<style scoped>
.session-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 14px;
  border-radius: var(--r-date);
  background: var(--btn);
  color: var(--on-brand);
  text-align: left;
  transition: background-color 0.15s ease;
}

.session-chip:active {
  background: var(--btn-hover);
}

.session-chip__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.session-chip__time {
  font-size: 14px;
  font-weight: 700;
}

.session-chip__tags {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.85;
}

.session-chip__price {
  font-size: 11px;
  opacity: 0.9;
}

.session-chip__price--muted {
  opacity: 0.6;
}

.session-chip.is-disabled {
  background: #ececf1;
  color: #9a9aa5;
  cursor: default;
}
</style>
