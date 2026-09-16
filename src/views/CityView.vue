<script setup>
// Выбор города из /api/v2/cities. Выбор персистится в localStorage (store.setCity),
// категории перезагружаются на новый cityId.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import StateMessage from '@/components/StateMessage.vue'
import { getCities } from '@/lib/endpoints'
import { store, setCity } from '@/store'

const router = useRouter()

const status = ref(store.cities.length ? 'ready' : 'loading')

const grouped = computed(() => {
  const map = new Map()
  for (const city of store.cities) {
    const region = city.region?.name || 'Другие'
    if (!map.has(region)) map.set(region, [])
    map.get(region).push(city)
  }
  return [...map.entries()]
})

async function load() {
  status.value = 'loading'
  try {
    store.cities = await getCities()
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

function pick(city) {
  setCity(city)
  router.back()
}
</script>

<template>
  <div class="city">
    <StateMessage
      v-if="status === 'error'"
      icon="refresh"
      title="Не получилось загрузить города"
      retryable
      @retry="load"
    />
    <p v-else-if="status === 'loading'" class="city__loading">Загрузка…</p>

    <template v-else>
      <div v-for="[region, cities] in grouped" :key="region" class="city__group">
        <p class="city__region">{{ region }}</p>
        <button
          v-for="city in cities"
          :key="city.id"
          class="city__row"
          :class="{ 'is-current': city.id === store.city.id }"
          type="button"
          @click="pick(city)"
        >
          <span>{{ city.name }}</span>
          <AppIcon v-if="city.id === store.city.id" name="pin" :size="16" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.city {
  padding: 8px 16px 24px;
}

.city__loading {
  padding: 32px 0;
  text-align: center;
  color: var(--text-muted);
}

.city__region {
  margin: 16px 2px 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted-2);
}

.city__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--r-input);
  background: var(--surface-2);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.city__row + .city__row {
  margin-top: 6px;
}

.city__row.is-current {
  color: var(--brand);
}
</style>
