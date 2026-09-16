<script setup>
// Лента дат на 30 дней: слоты 60×40, активный — рамка бренда, выходные — красным.
// Активный слот автоскроллится в центр (вручную, чтобы не дёргать страницу).
import { computed, onMounted, ref, watch } from 'vue'

import {
  addDays,
  dayNumber,
  isWeekend,
  monthShort,
  todayIso,
  weekdayShort,
} from '@/lib/date'

const props = defineProps({
  modelValue: { type: String, default: '' },
  days: { type: Number, default: 30 },
})

const emit = defineEmits(['update:modelValue'])

const strip = ref(null)

const days = computed(() => {
  const start = todayIso()
  return Array.from({ length: props.days }, (_, i) => {
    const iso = addDays(start, i)
    return {
      iso,
      day: dayNumber(iso),
      weekday: weekdayShort(iso),
      month: monthShort(iso),
      weekend: isWeekend(iso),
    }
  })
})

function scrollActive(smooth = true) {
  const container = strip.value
  const slot = container?.querySelector('.date-slot.is-active')
  if (!container || !slot) return
  container.scrollTo({
    left: slot.offsetLeft - container.clientWidth / 2 + slot.offsetWidth / 2,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

function onMount() {
  scrollActive(false)
}

onMounted(onMount)
watch(() => props.modelValue, () => scrollActive())
</script>

<template>
  <div ref="strip" class="date-strip scroll-row">
    <button
      v-for="item in days"
      :key="item.iso"
      class="date-slot"
      :class="{ 'is-active': item.iso === modelValue, 'is-weekend': item.weekend }"
      type="button"
      @click="emit('update:modelValue', item.iso)"
    >
      <span class="date-slot__day">{{ item.weekday }}</span>
      <span class="date-slot__num">{{ item.day }}</span>
    </button>
  </div>
</template>

<style scoped>
.date-strip {
  position: sticky;
  top: calc(var(--header-h) + var(--safe-top));
  z-index: 10;
  gap: 6px;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.date-slot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 60px;
  height: 40px;
  border: 1px solid var(--border-light);
  border-radius: var(--r-date);
  background: var(--surface);
}

.date-slot__day {
  font-size: 12px;
  line-height: 1;
  color: var(--text-muted-2);
}

.date-slot__num {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: var(--text);
}

.date-slot.is-weekend .date-slot__day {
  color: var(--weekend);
}

.date-slot.is-active {
  border: 2px solid var(--brand);
}

.date-slot.is-active .date-slot__day {
  color: var(--brand);
}

.date-slot.is-active .date-slot__num {
  color: var(--brand);
}
</style>
