<script setup>
// Блок площадки: название + адрес + чипы сеансов. Уже начавшиеся сеансы скрываются.
import { computed } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import SessionChip from '@/components/SessionChip.vue'
import { nowUnix } from '@/lib/date'

const props = defineProps({
  venue: { type: Object, required: true }, // {id, name, address, sessions}
})

const emit = defineEmits(['buy'])

const upcoming = computed(() =>
  (props.venue.sessions || [])
    .filter((session) => session.timeSpending > nowUnix())
    .sort((a, b) => (a.timeSpending || 0) - (b.timeSpending || 0)),
)
</script>

<template>
  <section v-if="upcoming.length" class="venue">
    <div class="venue__head">
      <p class="venue__name">{{ venue.name }}</p>
      <p v-if="venue.address" class="venue__address">
        <AppIcon name="pin" :size="12" />
        {{ venue.address }}
      </p>
    </div>
    <div class="venue__chips">
      <SessionChip
        v-for="session in upcoming"
        :key="session.id"
        :session="session"
        @buy="emit('buy', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.venue {
  padding: 16px;
  border-top: 1px solid var(--border-light);
}

.venue__head {
  margin-bottom: 12px;
}

.venue__name {
  font-size: 15px;
  font-weight: 700;
}

.venue__address {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.venue__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
