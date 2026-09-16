<script setup>
// Поиск: /api/v2/search, debounce 300 мс. Performances → деталка, objects — текстом.
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/AppIcon.vue'
import SearchField from '@/components/SearchField.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import { isAbort } from '@/lib/api'
import { search } from '@/lib/endpoints'

const router = useRouter()

const query = ref('')
const status = ref('idle') // idle | loading | ready | empty | error
const performances = ref([])
const objects = ref([])
let ctrl = null

watch(query, (value) => {
  const q = value.trim()
  ctrl?.abort()
  if (q.length < 2) {
    status.value = 'idle'
    performances.value = []
    objects.value = []
    return
  }
  load(q)
})

async function load(q) {
  ctrl = new AbortController()
  status.value = 'loading'
  try {
    const data = await search(q, ctrl.signal)
    // ответ мог устареть, пока летел запрос
    if (query.value.trim() !== q) return
    performances.value = data.performances
    objects.value = data.objects
    status.value = data.performances.length || data.objects.length ? 'ready' : 'empty'
  } catch (err) {
    if (!isAbort(err) && query.value.trim() === q) status.value = 'error'
  }
}

function open(performance) {
  router.push(`/event/${performance.slug}`)
}
</script>

<template>
  <div class="search">
    <div class="search__box">
      <SearchField v-model="query" />
    </div>

    <StateMessage
      v-if="status === 'error'"
      icon="refresh"
      title="Не получилось загрузить"
      retryable
      @retry="load(query.trim())"
    />
    <template v-else-if="status === 'loading'">
      <div class="search__list">
        <SkeletonBlock v-for="i in 4" :key="i" height="48px" />
      </div>
    </template>
    <StateMessage
      v-else-if="status === 'empty'"
      icon="search"
      title="Ничего не нашлось"
      :text="`По запросу «${query.trim()}» ничего нет`"
    />
    <StateMessage
      v-else-if="status === 'idle'"
      icon="search"
      title="Что ищем?"
      text="Введите минимум две буквы — покажем события и площадки"
    />

    <div v-else class="search__list">
      <button
        v-for="item in performances"
        :key="item.slug"
        class="search__row"
        type="button"
        @click="open(item)"
      >
        <span class="search__row-main">
          <span class="search__name">{{ item.name }}</span>
          <span v-if="item.types?.[0]?.name" class="search__kind">{{ item.types[0].name }}</span>
        </span>
        <AppIcon name="chevron-right" :size="16" />
      </button>

      <div v-if="objects.length" class="search__places">
        <p class="search__places-title">Площадки</p>
        <div v-for="place in objects" :key="place.slug" class="search__row search__row--static">
          <span class="search__row-main">
            <span class="search__name">{{ place.name }}</span>
            <span v-if="place.type?.name" class="search__kind">{{ place.type.name }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search__box {
  padding: 12px 16px 4px;
}

.search__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
}

.search__row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--r-input);
  background: var(--surface-2);
  text-align: left;
}

.search__row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.search__kind {
  font-size: 12px;
  color: var(--text-muted);
}

.search__places {
  margin-top: 8px;
}

.search__places-title {
  margin: 12px 2px 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted-2);
}
</style>
